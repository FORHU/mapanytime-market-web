"use client";

import { useState, useEffect, useCallback } from "react";

export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  status: "PENDING" | "SHIPPED" | "CANCELLED";
  createdAt: string;
  stockSnapshot: number; // Linked inventory node depth tracking
}

/**
 * Robust data engine hook orchestrating live state streams,
 * real-time WebSockets, and performance tracking hooks.
 */
export function useOrderSync() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial State Hydration Stream
  useEffect(() => {
    let isMounted = true;

    async function hydrateDashboardNodes() {
      try {
        setIsLoading(true);
        setError(null);

        // Replace with your orchestration endpoint architecture (e.g. TanStack Query queryFn)
        const response = await fetch("/api/orders");
        if (!response.ok)
          throw new Error("Network architecture rejected data layer pull.");

        const data = await response.json();
        if (isMounted) setOrders(data);
      } catch (err: any) {
        if (isMounted)
          setError(err?.message || "Data pipeline hydration failure.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    hydrateDashboardNodes();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time Event-Driven Synchronization Stream (WebSockets / SSE)
  useEffect(() => {
    // Replace with your production environment address protocol string
    const socketUrl =
      process.env.NEXT_PUBLIC_WS_GATEWAY_URL ||
      "wss://api.mapcentral.io/stream";
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      try {
        const rawPayload = JSON.parse(event.data);

        // Structured validation for hot event injection
        if (rawPayload && rawPayload.type === "ORDER_CREATED") {
          const newOrder: OrderRecord = rawPayload.data;

          // Prepend new order entry reactively to maintain real-time density positioning
          setOrders((currentOrders) => [newOrder, ...currentOrders]);
        }
      } catch (err) {
        console.error("Failed to parse ingress WebSocket frame payload:", err);
      }
    };

    ws.onerror = (err) =>
      console.error("Real-time pipeline socket fault:", err);
    return () => ws.close();
  }, []);

  return { orders, setOrders, isLoading, error };
}
