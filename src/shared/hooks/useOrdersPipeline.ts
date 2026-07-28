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
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: Boolean(token),
    staleTime: 5000,
  });

  useEffect(() => {
    if (!userId || !token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_WS_GATEWAY_URL || "http://localhost:4002";
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
        notification?.metadata?.type === "ORDER_PAID"
      ) {
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      }
    });

    socket.on("disconnect", () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, queryClient]);

  const fulfillmentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return fetcher(`/api/v1/orders/${orderId}/fulfill`, {
        method: "POST",
        body: JSON.stringify({ status: "SHIPPED" }),
      });
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData<OrderRecord[]>(queryKey);

      queryClient.setQueryData<OrderRecord[]>(queryKey, (old) => {
        return old?.map((order) => {
          if (order.id === orderId && order.status === "PENDING") {
            return {
              ...order,
              status: "SHIPPED",
              stockSnapshot: Math.max(0, order.stockSnapshot - order.quantity),
            };
          }
          return order;
        });
      });
      return { previousOrders };
    },
    onError: (err, orderId, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKey, context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });

  return {
    orders: query.data ?? ([] as OrderRecord[]),
    isLoading: query.isLoading,
    error: query.error,
    fulfillOrder: fulfillmentMutation.mutate,
    isMutationPending: fulfillmentMutation.isPending,
    mutationVariables: fulfillmentMutation.variables,
    forceManualRefresh: () =>
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
  };
};
