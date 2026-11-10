"use client";

import { useState } from "react";
import {
  Search,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Banknote,
} from "lucide-react";
import { format, formatDistanceToNow, isFuture } from "date-fns";
import { useAdminSellerSummaries } from "../hooks/useAdminSettlement";
import { formatPeso } from "@/shared/lib/currency";

interface SellerSettlementsTableProps {
  onSellerSelect?: (sellerId: string) => void;
}

export function SellerSettlementsTable({
  onSellerSelect,
}: SellerSettlementsTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminSellerSummaries({
      page,
      limit,
      search: activeSearch || undefined,
    });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.totalPages)) return;
    setPage(newPage);
  };

  const sellers = data?.sellers ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
          role="search"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search store name, organization, or merchant email..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="p-2 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)]/40 transition-colors disabled:opacity-50"
            title="Refresh table"
            aria-label="Refresh seller settlements"
          >
            <RotateCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {error instanceof Error
                ? error.message
                : "Failed to load seller settlement records"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs underline hover:text-rose-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/40 backdrop-blur-md shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--background-secondary)]/80 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Store & Merchant</th>
              <th className="py-3.5 px-4 text-right">Total GMV</th>
              <th className="py-3.5 px-4 text-right">Marketplace Fee</th>
              <th className="py-3.5 px-4 text-right">7-Day Return Hold</th>
              <th className="py-3.5 px-4 text-right">Available for Payout</th>
              <th className="py-3.5 px-4">Next Release</th>
              <th className="py-3.5 px-4 text-right">Cash Comm. Due</th>
              <th className="py-3.5 px-4 text-right">Total Paid Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {isLoading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-36 bg-[var(--background-tertiary)] rounded mb-1.5" />
                    <div className="h-3 w-28 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-16 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-16 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-14 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                    <Store className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                    <p className="text-sm font-semibold">
                      No seller settlement records found
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {activeSearch
                        ? "Try adjusting your search criteria"
                        : "Settlements will appear here once orders are confirmed and settled"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sellers.map((seller) => {
                const nextMaturity = seller.nextReleaseEligibleAt
                  ? new Date(seller.nextReleaseEligibleAt)
                  : null;
                const isMaturityFuture = nextMaturity
                  ? isFuture(nextMaturity)
                  : false;

                return (
                  <tr
                    key={seller.sellerId}
                    onClick={() => onSellerSelect?.(seller.sellerId)}
                    className={`transition-colors hover:bg-[var(--background-tertiary)]/40 ${
                      onSellerSelect ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Store & Merchant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)] leading-tight">
                            {seller.storeName ||
                              seller.organizationName ||
                              "Unnamed Store"}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            {seller.user.email}
                          </div>
                          {seller.settlementCount > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-[var(--text-tertiary)]">
                              {seller.settlementCount} settlement
                              {seller.settlementCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total GMV */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatPeso(seller.totalSales)}
                      </span>
                    </td>

                    {/* Marketplace Fee */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-semibold text-emerald-400">
                        {formatPeso(seller.totalCommission)}
                      </span>
                    </td>

                    {/* 7-Day Return Hold */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatPeso(seller.pendingAmount)}</span>
                      </div>
                    </td>

                    {/* Available for Payout */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-xs sm:text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatPeso(seller.availableAmount)}</span>
                      </div>
                    </td>

                    {/* Next Release Date */}
                    <td className="py-3.5 px-4">
                      {nextMaturity ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-[var(--text-primary)] text-xs">
                            {format(nextMaturity, "MMM d, yyyy")}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                            {isMaturityFuture ? (
                              <span>
                                In{" "}
                                {formatDistanceToNow(nextMaturity, {
                                  addSuffix: false,
                                })}
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-medium">
                                Ready to sweep
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)] text-xs">
                          No pending hold
                        </span>
                      )}
                    </td>

                    {/* Cash Commission Due */}
                    <td className="py-3.5 px-4 text-right">
                      {seller.cashCommissionOwed > 0 ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-xs">
                          <Banknote className="w-3 h-3 shrink-0" />
                          <span>{formatPeso(seller.cashCommissionOwed)}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)] text-xs">
                          ₱0.00
                        </span>
                      )}
                    </td>

                    {/* Total Paid Out */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[var(--text-secondary)] font-medium text-xs">
                        {formatPeso(seller.paidOutAmount)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--text-tertiary)]">
            Showing{" "}
            <span className="font-semibold text-[var(--text-secondary)]">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[var(--text-secondary)]">
              {Math.min(page * limit, total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--text-secondary)]">
              {total}
            </span>{" "}
            sellers
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || (isLoading && !data)}
              className="p-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)]/40 transition-colors disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || (isLoading && !data)}
              className="p-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)]/40 transition-colors disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
