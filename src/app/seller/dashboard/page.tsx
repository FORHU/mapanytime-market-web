"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { useOrdersPipeline } from "@/shared/hooks/useOrdersPipeline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  PackageCheck,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Box,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  const [skuSearch, setSkuSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const token = useAuthStore((state) => state.token);

  let userId: string | null = null;
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      userId = JSON.parse(jsonPayload).userId || null;
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }

  const {
    orders,
    isLoading,
    error,
    fulfillOrder,
    isMutationPending,
    mutationVariables,
    forceManualRefresh,
  } = useOrdersPipeline({
    userId,
    search: skuSearch,
    status: statusFilter,
    sortAsc,
  });

  const handleFulfillOrderOptimistic = useCallback(
    (orderId: string) => {
      fulfillOrder(orderId);
    },
    [fulfillOrder],
  );

  // Compute KPI metrics
  const totalRevenue = orders.reduce(
    (acc, order) => acc + (order.quantity || 1) * 350,
    0,
  );
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const lowStockCount = orders.filter((o) => o.stockSnapshot <= 10).length;

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-rose-700">
          Data Layer Crash Event Detected
        </h3>
        <p className="text-xs text-rose-600">{error.message}</p>
        <Button
          onClick={forceManualRefresh}
          className="!w-auto mx-auto bg-rose-600 hover:bg-rose-700 text-white"
        >
          Re-initialize Node Stream
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 w-full text-left">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-core)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Merchant Control Hub
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Store Performance Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/products">
            <Button
              variant="secondary"
              className="!h-9 !px-3.5 !text-xs border"
            >
              <Package className="w-3.5 h-3.5" /> Manage Products
            </Button>
          </Link>
          <Link href="/seller/ai-upload">
            <Button className="!h-9 !px-3.5 !text-xs bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> AI Import
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-[var(--border-light)] bg-gradient-to-br from-sky-500/10 via-[var(--background-secondary)] to-[var(--background-primary)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Estimated Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[var(--text-primary)]">
              ₱{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Live Gross Volume
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">
              {pendingCount}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block mt-1">
              Action Required
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Fulfilled Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-400">
              {shippedCount}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block mt-1">
              Marked as Shipped
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">
              {lowStockCount}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block mt-1">
              Items &le; 10 units
            </span>
          </div>
        </Card>
      </div>

      {/* Orders Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--background-elevated)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by SKU or customer..."
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>

          <div className="relative w-full sm:max-w-[180px]">
            <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)] appearance-none cursor-pointer"
              style={{ borderColor: "var(--border-light)" }}
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending Action</option>
              <option value="SHIPPED">Shipped Orders</option>
              <option value="CANCELLED">Cancelled Orders</option>
            </select>
          </div>
        </div>

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

      {/* Live Order Inventory Table */}
      <Card className="border border-[var(--border-default)] overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-zinc-400 font-medium"
                  >
                    <Box className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    No orders matching active filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isThisRowFulfilling =
                    isMutationPending && mutationVariables === order.id;

                  return (
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
                            {order.stockSnapshot} units
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
                            disabled={isMutationPending}
                            onClick={() =>
                              handleFulfillOrderOptimistic(order.id)
                            }
                            className="!h-8 !text-[10px] !px-3 !rounded-lg bg-[var(--brand-core)] hover:bg-[var(--brand-vibrant)] text-white shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>
                              {isThisRowFulfilling
                                ? "Shipping..."
                                : "Mark as Shipped"}
                            </span>
                          </Button>
                        ) : (
                          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 pr-2">
                            Fulfilled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
