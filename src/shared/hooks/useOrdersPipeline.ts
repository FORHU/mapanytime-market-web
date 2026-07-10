import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { io } from "socket.io-client"; // Commented out until backend is ready

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
  search?: string;
  status?: string;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}

export const ORDERS_QUERY_KEY = ["orders"];

export const useOrdersPipeline = (params: OrdersPipelineParams = {}) => {
  const {
    search = "",
    status = "ALL",
    sortAsc = false,
    page = 1,
    limit = 20,
  } = params;
  const queryClient = useQueryClient();
  const queryKey = [
    ...ORDERS_QUERY_KEY,
    { search, status, sortAsc, page, limit },
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
      const res = await fetch(`/api/orders?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Server engine stream delivery faulted.");
      return res.json();
    },
    staleTime: 5000, // Safe polling sync window until socket is live
  });

  /* ==========================================================
     SOCKET.IO PIPELINE (Awaiting Backend Deployment)
     ==========================================================
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_GATEWAY_URL || "http://localhost:4000";
    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("ORDER_CREATED", (newOrder: OrderRecord) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        if (currentOrders.some((order) => order.id === newOrder.id)) return currentOrders;
        return [newOrder, ...currentOrders];
      });
    });

    socket.on("disconnect", () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);
  ========================================================== */

  const fulfillmentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      if (!response.ok) throw new Error("Server rejected state updates.");
      return response.json();
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
