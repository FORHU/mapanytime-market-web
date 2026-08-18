// not used - backend REST route /api/orders not implemented, and nothing mounts
// this hook. Note the three socket events it listens for (order:created,
// order:updated, inventory:stock-sync) are not emitted by the API either, so
// IS_SOCKET_BACKEND_READY below cannot simply be flipped to true.
// See docs/connection-audit.md §5.
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Socket } from "socket.io-client";
import { acquireSocket, releaseSocket } from "@/shared/lib/socket";
import { socketBackedQueryOptions } from "@/shared/lib/query-options";

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

// TOGGLE FLAG: Switch to false since the backend hasn't implemented real-time sockets yet
const IS_SOCKET_BACKEND_READY = false;

export const useInventoryOrderSync = () => {
  const queryClient = useQueryClient();

  // 1. HTTP Layer: Fetch initial dashboard baseline state
  const query = useQuery<OrderRecord[], Error>({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load baseline order stream.");
      return res.json();
    },
    // Safe fall-back: standard 5-second staleness window until sockets go live
    staleTime: IS_SOCKET_BACKEND_READY ? Infinity : 5000,
    ...socketBackedQueryOptions,
  });

  useEffect(() => {
    // Escape loop immediately if the backend socket isn't ready
    if (!IS_SOCKET_BACKEND_READY) return;

    const socket: Socket = acquireSocket();

    const handleOrderCreated = (newOrder: OrderRecord) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        if (currentOrders.some((order) => order.id === newOrder.id))
          return currentOrders;
        return [newOrder, ...currentOrders];
      });
    };

    const handleOrderUpdated = (updatedOrder: OrderRecord) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        return currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        );
      });
    };

    const handleStockSync = (payload: { sku: string; newStock: number }) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        return currentOrders.map((order) =>
          order.sku === payload.sku
            ? { ...order, stockSnapshot: payload.newStock }
            : order,
        );
      });
    };

    const handleDisconnect = (reason: string) => {
      console.warn(`Socket disconnected: ${reason}. Invalidate queries.`);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    };

    socket.on("order:created", handleOrderCreated);
    socket.on("order:updated", handleOrderUpdated);
    socket.on("inventory:stock-sync", handleStockSync);
    socket.on("disconnect", handleDisconnect);

    return () => {
      // Remove by reference. Bare socket.off("event") strips *every* listener for that event,
      // which on a shared connection would silently kill other features' handlers too.
      socket.off("order:created", handleOrderCreated);
      socket.off("order:updated", handleOrderUpdated);
      socket.off("inventory:stock-sync", handleStockSync);
      socket.off("disconnect", handleDisconnect);
      releaseSocket();
    };
  }, [queryClient]);

  return query;
};
