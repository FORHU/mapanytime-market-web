"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  useOrdersPipeline,
  useStoreOverviewStats,
  type OrderRecord,
} from "@/shared/hooks/useOrdersPipeline";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  PackageCheck,
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Box,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Kanban,
  ListFilter,
  Clock,
  Store,
  User,
  ShoppingBag,
  Eye,
  X,
  ShieldCheck,
  Check,
  Phone,
  Calendar,
} from "lucide-react";

const PAGE_SIZE = 20;

/** Next step a seller can take, per current order status. */
const NEXT_STEP: Record<
  string,
  { status: string; label: string; className: string }
> = {
  PENDING: {
    status: "PROCESSING",
    label: "Start preparing",
    className: "bg-[var(--brand-core)] hover:opacity-90",
  },
  PROCESSING: {
    status: "READY_FOR_PICKUP",
    label: "Mark ready",
    className: "bg-blue-600 hover:bg-blue-700",
  },
  PREPARING: {
    status: "READY_FOR_PICKUP",
    label: "Mark ready",
    className: "bg-blue-600 hover:bg-blue-700",
  },
  READY_FOR_PICKUP: {
    status: "COMPLETED",
    label: "Complete pickup",
    className: "bg-emerald-600 hover:bg-emerald-700",
  },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "New",
  PROCESSING: "Preparing",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Completed",
  SHIPPED: "Completed",
  CANCELLED: "Cancelled",
};

function statusBadgeClasses(status: string) {
  if (status === "COMPLETED" || status === "SHIPPED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (status === "READY_FOR_PICKUP") {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800";
  }
  if (status === "CANCELLED") {
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800";
  }
  if (status === "PROCESSING" || status === "PREPARING") {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800";
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface StoreItem {
  id: string;
  storeName: string;
}

interface SellerOrdersBoardProps {
  /** "full" shows search, status filters, and Kanban toggle; "recent" shows a short preview. */
  variant?: "full" | "recent";
  /** Rows to show in the "recent" variant. */
  recentLimit?: number;
  activeStoreId?: string | null;
  stores?: StoreItem[];
}

export function SellerOrdersBoard({
  variant = "full",
  recentLimit = 5,
  activeStoreId = null,
  stores = [],
}: SellerOrdersBoardProps) {
  const isFull = variant === "full";
  const { userId, isHydrated } = useCurrentUser();

  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderRecord | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    orderId: string;
    targetStatus: string;
    label: string;
  } | null>(null);

  const effectiveStoreId = activeStoreId || selectedStoreFilter || null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortAsc, selectedStoreFilter]);

  const {
    orders,
    totalCount,
    pageCount,
    page: currentPage,
    isLoading,
    error,
    fulfillOrder,
    isMutationPending,
    mutationVariables,
    forceManualRefresh,
  } = useOrdersPipeline({
    userId,
    storeId: effectiveStoreId,
    search: isFull ? debouncedSearch : "",
    status: isFull ? (viewMode === "pipeline" ? "ALL" : statusFilter) : "ALL",
    sortAsc: isFull ? sortAsc : false,
    page: isFull ? page : 1,
    limit: isFull ? (viewMode === "pipeline" ? 60 : PAGE_SIZE) : recentLimit,
  });

  const { statusCounts } = useStoreOverviewStats({
    userId,
    storeId: effectiveStoreId,
  });

  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Group orders by column for the Kanban Pipeline view
  const pipelineGroups = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING");
    const preparing = orders.filter(
      (o) => o.status === "PROCESSING" || o.status === "PREPARING",
    );
    const ready = orders.filter((o) => o.status === "READY_FOR_PICKUP");
    const completed = orders.filter(
      (o) => o.status === "COMPLETED" || o.status === "SHIPPED",
    );
    return { pending, preparing, ready, completed };
  }, [orders]);

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-semibold text-rose-700 dark:text-rose-300">
          We couldn&apos;t load your orders
        </h3>
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {error.message}
        </p>
        <Button
          onClick={forceManualRefresh}
          className="!w-auto mx-auto bg-rose-600 hover:bg-rose-700 text-white"
        >
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {isFull ? (
        <div className="space-y-3 bg-[var(--background-elevated)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search by product, customer, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>

              {/* Store Filter Dropdown (in All Stores mode) */}
              {!activeStoreId && (
                <div className="relative sm:w-48">
                  <select
                    aria-label="Filter by Store"
                    value={selectedStoreFilter}
                    onChange={(e) => setSelectedStoreFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors truncate"
                    style={{
                      background: "var(--background-secondary)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">All Stores</option>
                    {(stores ?? []).map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* View Mode Toggle: Pipeline Kanban vs Table List */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center p-1 rounded-xl border bg-[var(--background-secondary)]"
                style={{ borderColor: "var(--border-light)" }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("pipeline")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "pipeline"
                      ? "bg-[var(--background-elevated)] text-[var(--brand-core)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" /> Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-[var(--background-elevated)] text-[var(--brand-core)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" /> List
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSortAsc((prev) => !prev)}
                title={
                  sortAsc ? "Showing oldest first" : "Showing newest first"
                }
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm shrink-0"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Tabs (Only when in Table List View) */}
          {viewMode === "table" && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pt-1 pb-0.5 scrollbar-thin">
              {[
                {
                  id: "ALL",
                  label: "All orders",
                  count: statusCounts?.ALL ?? 0,
                },
                {
                  id: "PENDING",
                  label: "New",
                  count: statusCounts?.PENDING ?? 0,
                },
                {
                  id: "PROCESSING",
                  label: "Preparing",
                  count: statusCounts?.PROCESSING ?? 0,
                },
                {
                  id: "READY_FOR_PICKUP",
                  label: "Ready for pickup",
                  count: statusCounts?.READY_FOR_PICKUP ?? 0,
                },
                {
                  id: "COMPLETED",
                  label: "Completed",
                  count: statusCounts?.COMPLETED ?? 0,
                },
                {
                  id: "CANCELLED",
                  label: "Cancelled",
                  count: statusCounts?.CANCELLED ?? 0,
                },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border inline-flex items-center gap-2 ${
                      isActive
                        ? "bg-[var(--brand-core)] border-[var(--brand-core)] text-white shadow-md font-semibold"
                        : "bg-[var(--background-secondary)] border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`min-w-[1.25rem] h-4.5 px-1 rounded-full inline-flex items-center justify-center text-[10px] font-semibold transition-colors ${
                        isActive
                          ? "bg-white text-[var(--brand-core)] shadow-sm"
                          : "bg-[var(--background-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Recent orders
          </h2>
          <Link
            href="/seller/orders"
            className="text-sm font-medium text-[var(--brand-core)] hover:underline inline-flex items-center gap-1"
          >
            View all orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── KANBAN PIPELINE VIEW ────────────────────────────────────────── */}
      {isFull && viewMode === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Column 1: New Orders */}
          <PipelineColumn
            title="New Orders"
            count={statusCounts?.PENDING ?? pipelineGroups.pending.length}
            orders={pipelineGroups.pending}
            badgeColor="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200"
            isLoading={isLoading}
            onSelectOrder={setSelectedOrderDetail}
            onAdvanceOrder={(order, next) =>
              setPendingConfirmation({
                orderId: order.id,
                targetStatus: next.status,
                label: next.label,
              })
            }
            isMutationPending={isMutationPending}
            updatingOrderId={mutationVariables?.orderId}
          />

          {/* Column 2: Preparing */}
          <PipelineColumn
            title="Preparing"
            count={statusCounts?.PROCESSING ?? pipelineGroups.preparing.length}
            orders={pipelineGroups.preparing}
            badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200"
            isLoading={isLoading}
            onSelectOrder={setSelectedOrderDetail}
            onAdvanceOrder={(order, next) =>
              setPendingConfirmation({
                orderId: order.id,
                targetStatus: next.status,
                label: next.label,
              })
            }
            isMutationPending={isMutationPending}
            updatingOrderId={mutationVariables?.orderId}
          />

          {/* Column 3: Ready for Pickup */}
          <PipelineColumn
            title="Ready for Pickup"
            count={
              statusCounts?.READY_FOR_PICKUP ?? pipelineGroups.ready.length
            }
            orders={pipelineGroups.ready}
            badgeColor="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200"
            isLoading={isLoading}
            onSelectOrder={setSelectedOrderDetail}
            onAdvanceOrder={(order, next) =>
              setPendingConfirmation({
                orderId: order.id,
                targetStatus: next.status,
                label: next.label,
              })
            }
            isMutationPending={isMutationPending}
            updatingOrderId={mutationVariables?.orderId}
          />

          {/* Column 4: Completed */}
          <PipelineColumn
            title="Completed"
            count={statusCounts?.COMPLETED ?? pipelineGroups.completed.length}
            orders={pipelineGroups.completed}
            badgeColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200"
            isLoading={isLoading}
            onSelectOrder={setSelectedOrderDetail}
            isMutationPending={isMutationPending}
            updatingOrderId={mutationVariables?.orderId}
          />
        </div>
      ) : (
        /* ── TABLE LIST VIEW ────────────────────────────────────────── */
        <Card className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-light)]">
                {!isHydrated || isLoading ? (
                  Array.from({ length: isFull ? 5 : recentLimit }).map(
                    (_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, cell) => (
                          <td key={cell} className="py-4 px-4">
                            <div className="h-4 w-24 bg-[var(--background-secondary)] rounded-md" />
                          </td>
                        ))}
                      </tr>
                    ),
                  )
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-[var(--text-secondary)]"
                    >
                      <Box className="w-8 h-8 mx-auto text-[var(--text-tertiary)] mb-2" />
                      {isFull && statusFilter !== "ALL"
                        ? "No orders match this filter."
                        : "No orders yet. New orders appear here as soon as a customer checks out."}
                    </td>
                  </tr>
                ) : (
                  orders.map((order: OrderRecord) => {
                    const isThisRowUpdating =
                      isMutationPending &&
                      mutationVariables?.orderId === order.id;
                    const nextStep = NEXT_STEP[order.status];

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[var(--background-secondary)]/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrderDetail(order)}
                      >
                        <td className="py-4 px-4 font-mono text-xs font-semibold text-[var(--text-primary)]">
                          <div className="flex items-center gap-2">
                            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-normal flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(order.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[var(--text-primary)] truncate max-w-xs">
                          {order.sku}
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-[var(--text-primary)]">
                          {order.quantity}
                        </td>
                        <td className="py-4 px-4 text-[var(--text-secondary)]">
                          {order.customer}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${statusBadgeClasses(
                                order.status,
                              )}`}
                            >
                              {(order.status === "COMPLETED" ||
                                order.status === "SHIPPED") && (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {STATUS_LABELS[order.status] ??
                                order.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>
                        <td
                          className="py-4 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetail(order)}
                              title="View details"
                              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {nextStep ? (
                              <Button
                                disabled={isMutationPending}
                                onClick={() =>
                                  setPendingConfirmation({
                                    orderId: order.id,
                                    targetStatus: nextStep.status,
                                    label: nextStep.label,
                                  })
                                }
                                className={`!h-8 !text-xs !px-3 !rounded-lg text-white shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50 ${nextStep.className}`}
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>
                                  {isThisRowUpdating
                                    ? "Updating…"
                                    : nextStep.label}
                                </span>
                              </Button>
                            ) : (
                              <span className="text-xs text-[var(--text-tertiary)] pr-2 font-medium">
                                {order.status === "CANCELLED"
                                  ? "Cancelled"
                                  : "Completed"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination (Table View Only) */}
      {isFull && viewMode === "table" && !isLoading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {rangeStart}–{rangeEnd} of {totalCount}{" "}
            {totalCount === 1 ? "order" : "orders"}
          </p>

          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-sm text-[var(--text-secondary)] px-1">
                Page {currentPage} of {pageCount}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ────────────────────────────────────────── */}
      {selectedOrderDetail && (
        <OrderDetailModal
          order={selectedOrderDetail}
          onClose={() => setSelectedOrderDetail(null)}
          onAdvanceStatus={(next) => {
            setPendingConfirmation({
              orderId: selectedOrderDetail.id,
              targetStatus: next.status,
              label: next.label,
            });
            setSelectedOrderDetail(null);
          }}
        />
      )}

      {/* ── STATUS UPDATE CONFIRMATION DIALOG ──────────────────────────── */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="border border-[var(--border-default)] max-w-md w-full p-6 shadow-2xl space-y-4 bg-[var(--background-elevated)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Confirm order update
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono">
                  #{pendingConfirmation.orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to mark this order as{" "}
              <strong className="text-[var(--text-primary)]">
                {pendingConfirmation.label.toLowerCase()}
              </strong>
              ? The customer will receive an immediate live update.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setPendingConfirmation(null)}
                className="!w-auto !text-xs !px-4 !rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={isMutationPending}
                onClick={() => {
                  fulfillOrder(
                    pendingConfirmation.orderId,
                    pendingConfirmation.targetStatus,
                  );
                  setPendingConfirmation(null);
                }}
                className="!w-auto !text-xs bg-[var(--brand-core)] hover:opacity-90 text-white !px-4 !rounded-xl shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isMutationPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm update</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/** ── Pipeline Column Component for Kanban View ───────────────────────── */
function PipelineColumn({
  title,
  count,
  orders,
  badgeColor,
  isLoading,
  onSelectOrder,
  onAdvanceOrder,
  isMutationPending,
  updatingOrderId,
}: {
  title: string;
  count: number;
  orders: OrderRecord[];
  badgeColor: string;
  isLoading?: boolean;
  onSelectOrder: (order: OrderRecord) => void;
  onAdvanceOrder?: (
    order: OrderRecord,
    next: { status: string; label: string },
  ) => void;
  isMutationPending?: boolean;
  updatingOrderId?: string;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl bg-[var(--background-secondary)]/50 border p-3 min-h-[480px]"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1 scrollbar-thin">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-xl bg-[var(--background-elevated)] animate-pulse border border-[var(--border-light)]"
            />
          ))
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-tertiary)] border border-dashed rounded-xl border-[var(--border-light)]">
            No orders
          </div>
        ) : (
          orders.map((order) => {
            const nextStep = NEXT_STEP[order.status];
            const isUpdating =
              isMutationPending && updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="group relative p-3.5 rounded-xl bg-[var(--background-elevated)] border hover:border-[var(--brand-core)] hover:shadow-md transition-all cursor-pointer space-y-2.5 text-left"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2">
                    {order.sku}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                    <span>{order.customer}</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {order.quantity} {order.quantity === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                {order.totalAmount !== undefined && (
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    ₱{Number(order.totalAmount).toLocaleString()}
                  </div>
                )}

                {nextStep && onAdvanceOrder && (
                  <div
                    className="pt-1.5 border-t border-[var(--border-light)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={isMutationPending}
                      onClick={() => onAdvanceOrder(order, nextStep)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${nextStep.className}`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{isUpdating ? "Updating…" : nextStep.label}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** ── Order Detail Modal Component ────────────────────────────────────── */
function OrderDetailModal({
  order,
  onClose,
  onAdvanceStatus,
}: {
  order: OrderRecord;
  onClose: () => void;
  onAdvanceStatus: (next: { status: string; label: string }) => void;
}) {
  const nextStep = NEXT_STEP[order.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--background-elevated)] border shadow-2xl p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto"
        style={{ borderColor: "var(--border-default)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-[var(--text-primary)]">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClasses(
                  order.status,
                )}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Information */}
        <div
          className="p-3.5 rounded-xl bg-[var(--background-secondary)] border space-y-2"
          style={{ borderColor: "var(--border-light)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Customer Information
          </span>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--brand-core)]" />
              <span className="font-semibold text-[var(--text-primary)]">
                {order.customer}
              </span>
            </div>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Order Items ({order.quantity})
          </span>
          <div
            className="p-3.5 rounded-xl bg-[var(--background-secondary)] border space-y-2"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-start justify-between text-sm">
              <div className="flex items-start gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[var(--brand-core)] mt-0.5" />
                <span className="font-medium text-[var(--text-primary)]">
                  {order.sku}
                </span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                x{order.quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        {order.totalAmount !== undefined && (
          <div
            className="p-3.5 rounded-xl bg-[var(--background-secondary)] border space-y-1.5 text-xs text-[var(--text-secondary)]"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex justify-between font-bold text-sm text-[var(--text-primary)] pt-1">
              <span>Total Amount</span>
              <span>₱{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-light)]">
          <Button variant="secondary" onClick={onClose} className="!text-xs">
            Close
          </Button>
          {nextStep && (
            <Button
              onClick={() => onAdvanceStatus(nextStep)}
              className={`!text-xs text-white shadow-md ${nextStep.className}`}
            >
              <PackageCheck className="w-3.5 h-3.5 mr-1" />
              {nextStep.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerOrdersBoard;
