import { io, Socket } from "socket.io-client";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/shared/lib/http";
import { getToken } from "@/shared/lib/token";

export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  stockSnapshot: number;
  status: "PENDING" | "SHIPPED" | "CANCELLED" | string;
  createdAt: string;
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

export const ORDERS_QUERY_KEY = ["orders"];
export const STORE_STATS_QUERY_KEY = ["store-overview-stats"];

export const useStoreOverviewStats = (params: {
  userId: string | null;
  storeId?: string | null;
}) => {
  const { userId, storeId } = params;
  const token = getToken();
  const activeStoreId =
    storeId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("active_store_context_id")
      : null);

  const queryKey = [
    ...STORE_STATS_QUERY_KEY,
    { userId, storeId: activeStoreId },
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const endpoint = activeStoreId
        ? `/api/v1/orders/seller?storeId=${activeStoreId}&status=ALL&limit=1000`
        : `/api/v1/orders?status=ALL&limit=1000`;
      const res: any = await fetcher(endpoint);
      const rawList: any[] = Array.isArray(res) ? res : res?.data || [];
      return rawList;
    },
    enabled: Boolean(token),
    staleTime: 5000,
  });

  const allOrders = query.data || [];
  const totalRevenue = allOrders.reduce(
    (acc: number, order: any) =>
      acc + (order.totalAmount || (order.quantity || 1) * 350),
    0,
  );
  const pendingCount = allOrders.filter(
    (o: any) =>
      o.status === "PENDING" ||
      o.status === "PROCESSING" ||
      o.status === "PREPARING" ||
      o.status === "READY_FOR_PICKUP" ||
      o.status === "READY",
  ).length;
  const fulfilledCount = allOrders.filter(
    (o: any) => o.status === "COMPLETED" || o.status === "SHIPPED",
  ).length;
  const lowStockCount = allOrders.filter(
    (o: any) => (o.stockSnapshot ?? 50) <= 10,
  ).length;

  const statusCounts = {
    ALL: allOrders.length,
    PENDING: allOrders.filter((o: any) => o.status === "PENDING").length,
    PREPARING: allOrders.filter(
      (o: any) => o.status === "PROCESSING" || o.status === "PREPARING",
    ).length,
    READY_FOR_PICKUP: allOrders.filter(
      (o: any) => o.status === "READY_FOR_PICKUP" || o.status === "READY",
    ).length,
    FULFILLED: allOrders.filter(
      (o: any) => o.status === "COMPLETED" || o.status === "SHIPPED",
    ).length,
    CANCELLED: allOrders.filter((o: any) => o.status === "CANCELLED").length,
  };

  return {
    allOrders,
    totalRevenue,
    pendingCount,
    fulfilledCount,
    lowStockCount,
    statusCounts,
    isLoading: query.isLoading,
  };
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

  const activeStoreId =
    storeId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("active_store_context_id")
      : null);

  const queryKey = [
    ...ORDERS_QUERY_KEY,
    { userId, storeId: activeStoreId, search, status, sortAsc, page, limit },
  ];

  const query = useQuery<OrderRecord[], Error>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        search,
        status,
        sort: sortAsc ? "asc" : "desc",
        page: String(page),
        limit: String(limit),
      });

      const endpoint = activeStoreId
        ? `/api/v1/orders/seller?storeId=${activeStoreId}&${searchParams.toString()}`
        : `/api/v1/orders?${searchParams.toString()}`;

      const res: any = await fetcher(endpoint);
      const rawList: any[] = Array.isArray(res) ? res : res?.data || [];

      const list: OrderRecord[] = rawList.map((o: any) => {
        const itemNames =
          o.orderitems
            ?.map((i: any) => i.product?.name || "Product")
            .join(", ") ||
          o.sku ||
          "N/A";
        const totalQty =
          o.orderitems?.reduce(
            (sum: number, i: any) => sum + (i.quantity || 1),
            0,
          ) ||
          o.quantity ||
          1;
        const customerName = o.buyer?.displayName || o.customer || "Customer";

        return {
          ...o,
          sku: itemNames,
          quantity: totalQty,
          customer: customerName,
          stockSnapshot: o.stockSnapshot ?? 50,
        };
      });

      if (status && status !== "ALL") {
        return list.filter((o) => {
          if (status === "PENDING") return o.status === "PENDING";
          if (status === "PROCESSING" || status === "PREPARING")
            return o.status === "PROCESSING" || o.status === "PREPARING";
          if (status === "READY_FOR_PICKUP" || status === "READY")
            return o.status === "READY_FOR_PICKUP" || o.status === "READY";
          if (status === "COMPLETED" || status === "FULFILLED")
            return o.status === "COMPLETED" || o.status === "SHIPPED";
          if (status === "CANCELLED") return o.status === "CANCELLED";
          return o.status === status;
        });
      }

      return list;
    },
    enabled: Boolean(token),
    staleTime: 5000,
  });

  useEffect(() => {
    if (!userId || !token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4002";
    const socket: Socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("subscribe_notifications", { userId });
    });

    socket.on("notification:new", (notification: any) => {
      if (
        notification?.metadata?.type === "ORDER_CREATED" ||
        notification?.metadata?.type === "ORDER_PAID" ||
        notification?.metadata?.type === "ORDER_UPDATED"
      ) {
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STORE_STATS_QUERY_KEY });
      }
    });

    socket.on("disconnect", () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_STATS_QUERY_KEY });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, queryClient]);

  const fulfillmentMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      return fetcher(`/api/v1/orders/${orderId}/fulfill`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData<OrderRecord[]>(queryKey);

      queryClient.setQueryData<OrderRecord[]>(queryKey, (old) => {
        return old?.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status,
              ...(status === "COMPLETED" && {
                stockSnapshot: Math.max(
                  0,
                  order.stockSnapshot - (order.quantity || 1),
                ),
              }),
            };
          }
          return order;
        });
      });
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKey, context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_STATS_QUERY_KEY });
    },
  });

  return {
    orders: query.data ?? ([] as OrderRecord[]),
    isLoading: query.isLoading,
    error: query.error,
    fulfillOrder: (orderId: string, status: string = "PREPARING") =>
      fulfillmentMutation.mutate({ orderId, status }),
    isMutationPending: fulfillmentMutation.isPending,
    mutationVariables: fulfillmentMutation.variables,
    forceManualRefresh: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_STATS_QUERY_KEY });
    },
  };
};
