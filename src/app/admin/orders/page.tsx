"use client";

import { useState } from "react";
import { ShoppingBag, Search } from "lucide-react";
import { useAdminOrders } from "@/features/adminOrders/hooks/useAdminOrders";
import type { AdminOrderStatus } from "@/features/adminOrders/contracts/adminOrder.contract";
import { formatPeso } from "@/shared/lib/currency";

const STATUS_TABS: Array<AdminOrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  PROCESSING: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  READY_FOR_PICKUP: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filtering and paging run in the database — this page used to render a
  // hardcoded array of invented US orders in dollars. See FLAGS.md ADM-3.
  const { data, isLoading, isError, error } = useAdminOrders({
    status: statusFilter,
    search,
    page,
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const onFilterChange = (status: AdminOrderStatus | "ALL") => {
    setStatusFilter(status);
    setPage(1);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[var(--brand-core)]" />
            Platform Order Oversight
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Buyer order volume, pickup times and payment method across every
            active store.
          </p>
        </div>
        {!isLoading && !isError && (
          <span className="text-xs font-bold text-[var(--text-tertiary)]">
            {total.toLocaleString("en-PH")} order{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {STATUS_TABS.map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange(st)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[var(--brand-core)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search order ID, buyer, or product..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-400">
          <p className="font-bold mb-1">Could not load orders.</p>
          <p className="text-xs opacity-80">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="p-12 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)] opacity-40" />
          <p className="font-bold text-[var(--text-primary)]">
            No orders found
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {search || statusFilter !== "ALL"
              ? "Try a different filter or search term."
              : "Orders will appear here once buyers start checking out."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-4 hover:border-sky-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-black text-sm text-sky-400">
                  {ord.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {ord.type}
                </span>
                {ord.paymentMethod && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {ord.paymentMethod}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                    STATUS_STYLES[ord.status] ??
                    "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {ord.status.replace(/_/g, " ")}
                </span>
                <span className="text-xl font-black text-[var(--text-primary)]">
                  {formatPeso(ord.totalAmount)}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Merchant Store:
                </span>
                <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">
                  {ord.storeName ?? "—"}
                </p>
              </div>

              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Buyer Info:
                </span>
                <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">
                  {ord.buyerName ?? "—"}
                </p>
                {ord.buyerPhone && (
                  <p className="text-[var(--text-tertiary)]">
                    {ord.buyerPhone}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Scheduled Pickup:
                </span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">
                  {formatDateTime(ord.pickupAt)}
                </p>
                <p className="text-[var(--text-tertiary)]">
                  Placed {formatDateTime(ord.createdAt)}
                </p>
              </div>
            </div>

            {ord.items.length > 0 && (
              <div className="pt-2 border-t border-[var(--border-light)] text-xs text-[var(--text-tertiary)]">
                Items:{" "}
                <strong className="text-[var(--text-secondary)]">
                  {ord.items
                    .map(
                      (item) =>
                        `${item.productName ?? "Unknown product"} (x${item.quantity})`,
                    )
                    .join(", ")}
                </strong>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--background-tertiary)] transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-[var(--text-tertiary)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--background-tertiary)] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
