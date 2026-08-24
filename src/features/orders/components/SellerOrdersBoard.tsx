"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  useOrdersPipeline,
  useStoreOverviewStats,
  type OrderRecord,
} from "@/shared/hooks/useOrdersPipeline";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { CashPickupCodeModal } from "./CashPickupCodeModal";
import {
  PackageCheck,
  QrCode,
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Box,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
    className: "bg-[var(--brand-core)] hover:bg-[var(--brand-vibrant)]",
  },
  PROCESSING: {
    status: "READY_FOR_PICKUP",
    label: "Mark ready for pickup",
    className: "bg-blue-600 hover:bg-blue-700",
  },
  PREPARING: {
    status: "READY_FOR_PICKUP",
    label: "Mark ready for pickup",
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
  return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800";
}

interface SellerOrdersBoardProps {
  /** "full" shows search and status filters; "recent" shows a short preview. */
  variant?: "full" | "recent";
  /** Rows to show in the "recent" variant. */
  recentLimit?: number;
}

export function SellerOrdersBoard({
  variant = "full",
  recentLimit = 5,
}: SellerOrdersBoardProps) {
  const isFull = variant === "full";
  const { userId, isHydrated } = useCurrentUser();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    orderId: string;
    targetStatus: string;
    label: string;
  } | null>(null);
  const [cashPickupOrder, setCashPickupOrder] = useState<{
    orderId: string;
    storeId: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortAsc]);

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
    generateCashPickupCode,
    forceManualRefresh,
  } = useOrdersPipeline({
    userId,
    search: isFull ? debouncedSearch : "",
    status: isFull ? statusFilter : "ALL",
    sortAsc: isFull ? sortAsc : false,
    page: isFull ? page : 1,
    limit: isFull ? PAGE_SIZE : recentLimit,
  });

  const { statusCounts } = useStoreOverviewStats({ userId });

  const visibleOrders = orders;
  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

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
    <div className="space-y-4">
      {isFull ? (
        <div className="space-y-3 bg-[var(--background-elevated)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search by product or customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>

            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              title={sortAsc ? "Showing oldest first" : "Showing newest first"}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm shrink-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full pt-1 pb-0.5">
            {[
              { id: "ALL", label: "All orders", count: statusCounts?.ALL ?? 0 },
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
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border inline-flex items-center gap-2 ${
                    isActive
                      ? "bg-[var(--brand-core)] border-[var(--brand-core)] text-white shadow-md font-semibold"
                      : "bg-[var(--background-secondary)] border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`min-w-[1.25rem] h-5 px-1 rounded-full inline-flex items-center justify-center text-xs font-semibold transition-colors ${
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
              ) : visibleOrders.length === 0 ? (
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
                visibleOrders.map((order: OrderRecord) => {
                  const isThisRowUpdating =
                    isMutationPending &&
                    mutationVariables?.orderId === order.id;
                  const nextStep = NEXT_STEP[order.status];
                  // Cash on Pickup at READY_FOR_PICKUP shows a code for the
                  // buyer to scan instead of the seller marking it complete
                  // unilaterally — every other status/payment combo keeps
                  // the existing seller-driven flow.
                  const isCashPickupStep =
                    order.status === "READY_FOR_PICKUP" &&
                    order.paymentMethodType === "CASH";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--background-secondary)]/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-[var(--text-primary)]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-primary)]">
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
                      <td className="py-4 px-4 text-right">
                        {isCashPickupStep ? (
                          <Button
                            onClick={() =>
                              setCashPickupOrder({
                                orderId: order.id,
                                storeId: order.storeId,
                              })
                            }
                            className="!h-9 !text-xs !px-3 !rounded-lg text-white shadow-sm inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Show pickup code</span>
                          </Button>
                        ) : nextStep ? (
                          <Button
                            disabled={isMutationPending}
                            onClick={() =>
                              setPendingConfirmation({
                                orderId: order.id,
                                targetStatus: nextStep.status,
                                label: nextStep.label,
                              })
                            }
                            className={`!h-9 !text-xs !px-3 !rounded-lg text-white shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50 ${nextStep.className}`}
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>
                              {isThisRowUpdating ? "Updating…" : nextStep.label}
                            </span>
                          </Button>
                        ) : (
                          <span className="text-sm text-[var(--text-tertiary)] pr-2">
                            {order.status === "CANCELLED"
                              ? "Cancelled"
                              : "Done"}
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

      {isFull && !isLoading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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

      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="border border-[var(--border-default)] max-w-md w-full p-6 shadow-2xl space-y-4 bg-[var(--background-primary)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Update this order?
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Order #{pendingConfirmation.orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              This marks the order as{" "}
              <strong className="text-[var(--text-primary)]">
                {pendingConfirmation.label.toLowerCase()}
              </strong>{" "}
              and notifies the customer straight away.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setPendingConfirmation(null)}
                className="!w-auto !text-sm !px-4 !rounded-xl"
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
                className="!w-auto !text-sm bg-[var(--brand-core)] hover:bg-[var(--brand-vibrant)] text-white !px-4 !rounded-xl shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isMutationPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating…</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {cashPickupOrder && (
        <CashPickupCodeModal
          orderId={cashPickupOrder.orderId}
          storeId={cashPickupOrder.storeId}
          onClose={() => setCashPickupOrder(null)}
          onGenerate={generateCashPickupCode}
        />
      )}
    </div>
  );
}

export default SellerOrdersBoard;
