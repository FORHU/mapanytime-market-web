import { type Socket } from "socket.io-client";
import { acquireSocket, releaseSocket } from "@/shared/lib/socket";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/shared/lib/http";
import { getToken } from "@/shared/lib/token";
import { socketBackedQueryOptions } from "@/shared/lib/query-options";

export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  /** Null when the API did not report a stock level — never guess one. */
  stockSnapshot: number | null;
  status: "PENDING" | "SHIPPED" | "CANCELLED" | string;
  createdAt: string;
  subtotalAmount?: number;
  taxAmount?: number;
  marketplaceFeeAmount?: number;
  sellerNetAmount?: number;
  totalAmount?: number;
}

export interface OrdersPage {
  items: OrderRecord[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface StoreOrderStatusCounts {
  ALL: number;
  PENDING: number;
  PROCESSING: number;
  READY_FOR_PICKUP: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface StoreOrderStats {
  totalRevenue: number;
  pendingCount: number;
  fulfilledCount: number;
  statusCounts: StoreOrderStatusCounts;
  lowStockCount: number;
}

export interface OrdersPipelineParams {
  userId: string | null;
  storeId?: string | null;
  search?: string;
  status?: string;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}

export const ORDERS_QUERY_KEY = ["seller-orders"];
export const ORDER_STATS_QUERY_KEY = ["seller-order-stats"];

const EMPTY_PAGE: OrdersPage = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 20,
};

const EMPTY_STATS: StoreOrderStats = {
  totalRevenue: 0,
  pendingCount: 0,
  fulfilledCount: 0,
  statusCounts: {
    ALL: 0,
    PENDING: 0,
    PROCESSING: 0,
    READY_FOR_PICKUP: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  },
  lowStockCount: 0,
};

function readActiveStoreId(storeId?: string | null) {
  if (storeId) return storeId;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("active_store_context_id");
}

function normalize(o: Record<string, any>): OrderRecord {
  const itemNames =
    o.orderitems?.map((i: any) => i.product?.name || "Product").join(", ") ||
    o.sku ||
    "N/A";
  const totalQty =
    o.orderitems?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) ||
    o.quantity ||
    1;

  return {
    ...o,
    sku: itemNames,
    quantity: totalQty,
    customer: o.buyer?.displayName || o.customer || "Customer",
    stockSnapshot: typeof o.stockSnapshot === "number" ? o.stockSnapshot : null,
  } as OrderRecord;
}

/**
 * Paginated store orders — `GET /v1/orders/store` does the filtering,
 * searching, sorting and paging in the database. Every param is part of the
 * query key, so each page/filter combination is cached separately and the
 * client only ever holds the page it is displaying. When no store is
 * selected the backend scopes the result to all of the seller's stores.
 */
function useStoreOrdersQuery(params: {
  userId: string | null;
  storeId?: string | null;
  search?: string;
  status?: string;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  const activeStoreId = readActiveStoreId(params.storeId);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const search = params.search?.trim() ?? "";
  const status =
    params.status && params.status !== "ALL" ? params.status : undefined;
  const sortOrder = params.sortAsc ? "asc" : "desc";

  return useQuery<OrdersPage, Error>({
    queryKey: [
      ...ORDERS_QUERY_KEY,
      {
        userId: params.userId,
        storeId: activeStoreId,
        page,
        limit,
        search,
        status,
        sortOrder,
      },
    ],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortOrder,
      });
      if (activeStoreId) query.set("storeId", activeStoreId);
      if (search) query.set("search", search);
      if (status) query.set("status", status);

      const res: any = await fetcher(`/api/v1/orders/store?${query}`);
      const data = res?.data ?? {};
      const rawList: any[] = Array.isArray(data.items) ? data.items : [];

      return {
        items: rawList.map(normalize),
        total: Number(data.total) || 0,
        totalPages: Math.max(1, Number(data.totalPages) || 1),
        page: Number(data.page) || page,
        limit: Number(data.limit) || limit,
      };
    },
    enabled: Boolean(token),
    staleTime: 5000,
    ...socketBackedQueryOptions,
  });
}

/**
 * Dashboard tile + tab counters — computed by the backend
 * (`GET /v1/orders/store/stats`) from database aggregates rather than by
 * summing the store's full order history in the browser.
 */
export const useStoreOverviewStats = (params: {
  userId: string | null;
  storeId?: string | null;
}) => {
  const token = getToken();
  const activeStoreId = readActiveStoreId(params.storeId);

  const query = useQuery<StoreOrderStats, Error>({
    queryKey: [
      ...ORDER_STATS_QUERY_KEY,
      { userId: params.userId, storeId: activeStoreId },
    ],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (activeStoreId) query.set("storeId", activeStoreId);

      const res: any = await fetcher(`/api/v1/orders/store/stats?${query}`);
      const data = res?.data ?? {};

      return {
        ...EMPTY_STATS,
        ...data,
        statusCounts: { ...EMPTY_STATS.statusCounts, ...data.statusCounts },
      };
    },
    enabled: Boolean(token),
    staleTime: 5000,
    ...socketBackedQueryOptions,
  });

  return { ...(query.data ?? EMPTY_STATS), isLoading: query.isLoading };
};

export const useOrdersPipeline = (params: OrdersPipelineParams) => {
  const {
    userId,
    storeId,
    search = "",
    status = "ALL",
    sortAsc = false,
    page = 1,
    limit = 20,
  } = params;

  const queryClient = useQueryClient();
  const token = getToken();

  const query = useStoreOrdersQuery({
    userId,
    storeId,
    search,
    status,
    sortAsc,
    page,
    limit,
  });

  const data = query.data ?? { ...EMPTY_PAGE, page, limit };
  // Clamp an out-of-range page for display (e.g. a filter shrank the list).
  const safePage = Math.min(Math.max(1, data.page), data.totalPages);

  useEffect(() => {
    if (!userId || !token) return;

    const socket: Socket = acquireSocket();

    const handleConnect = () => {
      socket.emit("subscribe_notifications", { userId });
    };

    const handleNotification = (notification: any) => {
      if (
        notification?.metadata?.type === "ORDER_CREATED" ||
        notification?.metadata?.type === "ORDER_PAID" ||
        notification?.metadata?.type === "ORDER_UPDATED"
      ) {
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
      }
    };

    const handleDisconnect = () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
    };

    // Already-connected shared socket emits no further "connect" event.
    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);
    socket.on("notification:new", handleNotification);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification:new", handleNotification);
      socket.off("disconnect", handleDisconnect);
      releaseSocket();
    };
  }, [userId, token, queryClient]);

  const fulfillmentMutation = useMutation({
    mutationFn: async ({
      orderId,
      status: nextStatus,
    }: {
      orderId: string;
      status: string;
    }) => {
      // Backend exposes a single body-driven endpoint, not a per-order path.
      return fetcher(`/api/v1/orders/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
    },
    // No optimistic cache edit: with server-side pagination the affected row
    // may not even be on the current page, and a status change can move it
    // across filter pages. Refetch the current page + stats instead.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
    },
  });

  return {
    orders: data.items,
    totalCount: data.total,
    pageCount: data.totalPages,
    page: safePage,
    isLoading: query.isLoading,
    error: query.error,
    fulfillOrder: (orderId: string, status: string = "PREPARING") =>
      fulfillmentMutation.mutate({ orderId, status }),
    isMutationPending: fulfillmentMutation.isPending,
    mutationVariables: fulfillmentMutation.variables,
    forceManualRefresh: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
    },
  };
};
