"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  useAdminAgentPayouts,
  useApproveAgentPayout,
  useRejectAgentPayout,
} from "../hooks/useAdminAgentPayouts";
import {
  AgentPayoutItem,
  AgentPayoutStatus,
} from "../contracts/agentPayout.contract";
import { formatPeso } from "@/shared/lib/currency";

const STATUS_FILTERS: { label: string; value: AgentPayoutStatus | "ALL" }[] = [
  { label: "All Requests", value: "ALL" },
  { label: "Pending Review", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected / Failed", value: "FAILED" },
];

export function AgentPayoutsTable() {
  const [statusFilter, setStatusFilter] = useState<AgentPayoutStatus | "ALL">(
    "ALL",
  );
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [approveTarget, setApproveTarget] = useState<AgentPayoutItem | null>(null);
  const [approveRef, setApproveRef] = useState("");
  const [rejectTarget, setRejectTarget] = useState<AgentPayoutItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const approveModalRef = useRef<HTMLDivElement>(null);
  const rejectModalRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminAgentPayouts({
      page,
      limit,
      status: statusFilter,
      search: activeSearch || undefined,
    });

  const approveMutation = useApproveAgentPayout();
  const rejectMutation = useRejectAgentPayout();

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setApproveTarget(null);
        setRejectTarget(null);
        setActionError(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleStatusFilterChange = (val: AgentPayoutStatus | "ALL") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.totalPages)) return;
    setPage(newPage);
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setActionError(null);
    try {
      await approveMutation.mutateAsync({
        id: approveTarget.id,
        reference: approveRef.trim() || undefined,
      });
      setApproveTarget(null);
      setApproveRef("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve payout request",
      );
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason.trim() || undefined,
      });
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to reject payout request",
      );
    }
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const renderStatusBadge = (status: AgentPayoutStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <RotateCcw className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)]">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusFilterChange(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[var(--brand-core)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]/50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80" role="search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search agent name or email..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
            />
          </form>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="p-2 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)]/40 transition-colors disabled:opacity-50"
            title="Refresh list"
            aria-label="Refresh agent payouts"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {error instanceof Error ? error.message : "Failed to load agent payouts"}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/40 backdrop-blur-md shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--background-secondary)]/80 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Recruiter Agent</th>
              <th className="py-3.5 px-4 text-right">Requested Amount</th>
              <th className="py-3.5 px-4">Method & Reference</th>
              <th className="py-3.5 px-4">Requested Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {isLoading && !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded mb-1" />
                    <div className="h-3 w-40 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-6 w-24 bg-[var(--background-tertiary)] rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                    <Users className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                    <p className="text-sm font-semibold">No agent payout requests found</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {activeSearch || statusFilter !== "ALL"
                        ? "Try clearing filters or search criteria"
                        : "Requests will appear here when recruiter agents request commission payouts (₱500+)"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((payout) => {
                const requestedDate = new Date(payout.createdAt);
                const fullName = [payout.agent?.firstName, payout.agent?.lastName]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr key={payout.id} className="transition-colors hover:bg-[var(--background-tertiary)]/40">
                    {/* Agent details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">
                            {fullName || "Recruiter Agent"}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {payout.agent?.email || payout.agentId}
                          </div>
                          {payout.agent?.phoneNumber && (
                            <div className="text-[10px] text-[var(--text-tertiary)]">
                              {payout.agent.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-sm sm:text-base text-cyan-400">
                        {formatPeso(payout.amount)}
                      </span>
                    </td>

                    {/* Method & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span>{payout.paymentMethod}</span>
                        </div>
                        {payout.reference ? (
                          <div className="text-[11px] text-[var(--text-secondary)] font-mono truncate max-w-xs">
                            {payout.reference}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--text-tertiary)]">
                            No reference code
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="text-xs text-[var(--text-primary)]">
                          {format(requestedDate, "MMM d, yyyy")}
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">
                          {formatDistanceToNow(requestedDate, { addSuffix: true })}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(payout.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {payout.status === "PENDING" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null);
                              setApproveTarget(payout);
                              setApproveRef("");
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null);
                              setRejectTarget(payout);
                              setRejectReason("");
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">
                          Settled
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

      {/* Pagination */}
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
            requests
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

      {/* Approve Modal */}
      {approveTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            ref={approveModalRef}
            className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    Approve Agent Payout
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Confirm disbursement to recruiter agent
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/60 border border-[var(--border-default)] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Agent:</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {approveTarget.agent?.email || approveTarget.agentId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Amount:</span>
                <span className="font-black text-sm text-emerald-400">
                  {formatPeso(approveTarget.amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Method:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {approveTarget.paymentMethod}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">
                Bank / Disbursement Reference Note (optional)
              </label>
              <input
                type="text"
                value={approveRef}
                onChange={(e) => setApproveRef(e.target.value)}
                placeholder="e.g. BDO-REF-10928374 or GCASH-TX-9921"
                className="w-full px-3.5 py-2 text-xs rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                disabled={approveMutation.isPending}
                className="px-4 py-2 text-xs font-bold rounded-2xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                disabled={approveMutation.isPending}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {approveMutation.isPending ? "Approving..." : "Confirm Payout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            ref={rejectModalRef}
            className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    Reject Payout Request
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Withheld amount will be refunded to the agent
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/60 border border-[var(--border-default)] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Agent:</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {rejectTarget.agent?.email || rejectTarget.agentId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Refund Amount:</span>
                <span className="font-black text-sm text-rose-400">
                  {formatPeso(rejectTarget.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid bank account details or pending verification"
                className="w-full px-3.5 py-2 text-xs rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] resize-none"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 text-xs font-bold rounded-2xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
