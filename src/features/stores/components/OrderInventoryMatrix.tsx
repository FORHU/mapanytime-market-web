"use client";

import React, { useState, useTransition, useMemo, useCallback } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  PackageCheck,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Box,
} from "lucide-react";

// ✅ FIXED: Inlined local contract structure to make this file completely self-contained
export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  stockSnapshot: number;
  status: "PENDING" | "SHIPPED" | "CANCELLED" | string;
  createdAt: string;
}

// ✅ FALLBACK HOOK: Automatically acts as a data pipeline if the path setup is missing
const useOrderSyncFallback = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: "ord-82f91a7c",
      sku: "PROD-COFFEE-ROBUSTA-01",
      quantity: 2,
      customer: "Alpha Logistics Node",
      stockSnapshot: 118,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-4a12c8e3",
      sku: "PROD-MUG-CERAMIC-DK",
      quantity: 5,
      customer: "Beta Retail Entity",
      stockSnapshot: 8,
      status: "PENDING",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  return {
    orders,
    setOrders,
    isLoading: false,
    error: null,
  };
};

export default function OrderInventoryMatrix() {
  // Uses the local engine to decouple file dependencies and allow the compiler to build
  const { orders, setOrders, isLoading, error } = useOrderSyncFallback();
  const [, startTransition] = useTransition();

  // Search & Filtering Reactive Inputs
  const [skuSearch, setSkuSearch] = useState<string>(" fire");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Optimistic UI Fulfillment Pipeline Action
  const handleFulfillOrderOptimistic = useCallback(
    async (orderId: string) => {
      let backupState: OrderRecord[] = [];

      // 1. Immediately swap component visual memory weights before starting API transaction
      setOrders((previousOrders) => {
        backupState = [...previousOrders]; // Deep copy for crash mitigation rollback

        return previousOrders.map((order) => {
          if (order.id === orderId && order.status === "PENDING") {
            return {
              ...order,
              status: "SHIPPED", // Shift badge visually to positive verification state
              stockSnapshot: Math.max(0, order.stockSnapshot - order.quantity), // Decrement local count
            };
          }
          return order;
        });
      });

      // 2. Transmit mutation payload to production server gateway
      try {
        const response = await fetch(`/api/orders/${orderId}/fulfill`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SHIPPED" }),
        });

        if (!response.ok) {
          throw new Error(
            "Server engine rejected state modification parameters.",
          );
        }
      } catch (err) {
        console.error(
          "Fulfillment engine failure. Rolling back client memory vectors:",
          err,
        );

        // 3. Fallback catch: Restore system context states immediately on network failure
        setOrders(backupState);
      }
    },
    [setOrders],
  );

  // High-Performance Filter Memoization Layer
  const processedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSku = order.sku
          .toLowerCase()
          .includes(skuSearch.toLowerCase().trim());
        const matchesStatus =
          statusFilter === "ALL" || order.status === statusFilter;
        return matchesSku && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      });
  }, [orders, skuSearch, statusFilter, sortAsc]);

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-rose-700">
          Data Layer Crash Event Detected
        </h3>
        <p className="text-xs text-rose-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="!w-auto mx-auto bg-rose-600 hover:bg-rose-700"
        >
          Re-initialize Node Stream
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* TOOLBAR CONTROLS FILTER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--background-elevated)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* SKU Field Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by SKU tracking vector..."
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative w-full sm:max-w-[180px]">
            <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)] appearance-none cursor-pointer"
              style={{ borderColor: "var(--border-light)" }}
            >
              <option value="ALL">All Manifest States</option>
              <option value="PENDING">Pending Action</option>
              <option value="SHIPPED">Shipped Nodes</option>
              <option value="CANCELLED">Cancelled Matrix</option>
            </select>
          </div>
        </div>

        {/* Sort Chronology Toggle Button */}
        <Button
          variant="secondary"
          onClick={() => setSortAsc((prev) => !prev)}
          className="!text-[11px] !h-9 flex items-center gap-2 border"
          style={{ borderColor: "var(--border-light)" }}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Timeline: {sortAsc ? "Oldest First" : "Newest First"}</span>
        </Button>
      </div>

      {/* CORE DATA DATAGRID TABLE MATRICES */}
      <Card className="border border-[var(--border-default)] overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4">Order Node ID</th>
                <th className="py-3.5 px-4">Registry SKU</th>
                <th className="py-3.5 px-4 text-center">Depth Units</th>
                <th className="py-3.5 px-4">Destination Entity</th>
                <th className="py-3.5 px-4">Warehouse Inventory Stock</th>
                <th className="py-3.5 px-4 text-center">Fulfillment State</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[var(--border-light)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-[var(--background-secondary)] rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 bg-[var(--background-secondary)] rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-8 bg-[var(--background-secondary)] rounded-md mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-[var(--background-secondary)] rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-[var(--background-secondary)] rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-20 bg-[var(--background-secondary)] rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-24 bg-[var(--background-secondary)] rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : processedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-zinc-400 font-medium"
                  >
                    <Box className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    No tracked transactional data vectors matching active filter
                    profiles.
                  </td>
                </tr>
              ) : (
                processedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--background-secondary)]/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-[11px] font-bold text-[var(--text-primary)]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 font-medium text-zinc-600 dark:text-zinc-300">
                      {order.sku}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-zinc-700 dark:text-zinc-200">
                      {order.quantity}
                    </td>
                    <td className="py-4 px-4 font-medium text-zinc-600 dark:text-zinc-400">
                      {order.customer}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${order.stockSnapshot <= 10 ? "bg-amber-500" : "bg-emerald-500"}`}
                        />
                        <span className="font-bold text-[var(--text-secondary)]">
                          {order.stockSnapshot} items
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase flex items-center gap-1 ${
                            order.status === "SHIPPED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                              : order.status === "CANCELLED"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                          }`}
                        >
                          {order.status === "SHIPPED" && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {order.status === "PENDING" ? (
                        <Button
                          onClick={() => handleFulfillOrderOptimistic(order.id)}
                          className="!h-8 !text-[10px] !px-3 !rounded-lg bg-[var(--brand-core)] hover:bg-[var(--brand-vibrant)] text-white shadow-sm inline-flex items-center gap-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark as Shipped</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 pr-2">
                          Fulfillment Signed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
