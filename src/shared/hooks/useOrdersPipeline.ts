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

export const ORDERS_QUERY_KEY = ["orders"];

export const useOrdersPipeline = () => {
  const queryClient = useQueryClient();

  const query = useQuery<OrderRecord[], Error>({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/orders");
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
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY });
      const previousOrders =
        queryClient.getQueryData<OrderRecord[]>(ORDERS_QUERY_KEY);

      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
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
        queryClient.setQueryData(ORDERS_QUERY_KEY, context.previousOrders);
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
