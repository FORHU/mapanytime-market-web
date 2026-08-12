"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Home,
  LandPlot,
  MapPin,
  Search,
  Store,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useApprovals } from "@/features/adminApprovals/hooks/useApprovals";
import { useApprovalActions } from "@/features/adminApprovals/hooks/useApprovalActions";
import type {
  ApprovalItem,
  ApprovalStatus,
} from "@/features/adminApprovals/contracts/approval.contract";

type ApprovalFilter = "ALL" | ApprovalStatus;

export default function AdminStoresPage() {
  const [activeFilter, setActiveFilter] = useState<ApprovalFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionTarget, setRejectionTarget] = useState<ApprovalItem | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { data: approvals = [], isLoading, isError, error } = useApprovals();
  const { approve, reject } = useApprovalActions();

  const filteredApprovals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return approvals.filter((item) => {
      const matchesFilter =
        activeFilter === "ALL" || item.status === activeFilter;
      const searchable = [item.name, item.owner, item.email, item.address]
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!query || searchable.includes(query));
    });
  }, [activeFilter, approvals, searchQuery]);

  const handleReject = () => {
    if (!rejectionTarget || rejectionReason.trim().length < 3) return;

    reject.mutate(
      { item: rejectionTarget, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectionTarget(null);
          setRejectionReason("");
        },
      },
    );
  };

  const handleApprove = useCallback(
    (item: ApprovalItem) => {
      const key = `${item.entityType}:${item.id}`;
      if (processingIds.has(key) || approve.isPending) return;

      setProcessingIds((prev) => new Set(prev).add(key));
      approve.mutate(item, {
        onSettled: () => {
          setProcessingIds((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        },
      });
    },
    [approve, processingIds],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl">
          <Building2 className="h-7 w-7 text-[var(--brand-core)]" />
          Store Management &amp; Approvals
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
          Review store and House/Lot submissions, verify their details, and
          manage approval status.
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 p-4 sm:flex-row">
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {(["ALL", "PENDING", "ACTIVE", "REJECTED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeFilter === filter
                  ? "bg-[var(--brand-core)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : filter === "PENDING"
                  ? "Pending"
                  : filter === "ACTIVE"
                    ? "Active"
                    : "Rejected"}{" "}
              (
              {filter === "ALL"
                ? approvals.length
                : approvals.filter((item) => item.status === filter).length}
              )
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search stores or owners..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] py-2 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--brand-core)] focus:outline-none"
          />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-[var(--border-light)] p-10 text-center text-sm text-[var(--text-secondary)]">
          Loading approval requests...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          Could not load approval requests: {error?.message}
        </div>
      )}

      {!isLoading && !isError && filteredApprovals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border-light)] p-12 text-center text-sm text-[var(--text-secondary)]">
          No approval requests match the current filter.
        </div>
      )}

      {!isLoading && !isError && filteredApprovals.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredApprovals.map((item) => {
            const itemKey = `${item.entityType}:${item.id}`;
            return (
              <ApprovalCard
                key={itemKey}
                item={item}
                isApproving={processingIds.has(itemKey)}
                isRejecting={reject.isPending}
                onApprove={() => handleApprove(item)}
                onReject={() => {
                  setRejectionTarget(item);
                  setRejectionReason(item.rejectionReason ?? "");
                }}
              />
            );
          })}
        </div>
      )}

      {rejectionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-6 shadow-2xl">
            <h2 className="text-lg font-black text-[var(--text-primary)]">
              Reject {rejectionTarget.name}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Give the seller a clear reason for this decision.
            </p>
            <textarea
              autoFocus
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--background-primary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-core)]"
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setRejectionTarget(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={rejectionReason.trim().length < 3 || reject.isPending}
                onClick={handleReject}
              >
                {reject.isPending ? "Rejecting..." : "Reject Submission"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isProperty = item.entityType === "PROPERTY";
  const isPending = item.status === "PENDING";
  const Icon = isProperty
    ? item.propertyType === "RAW_LAND"
      ? LandPlot
      : Home
    : Store;

  return (
    <div className="flex flex-col justify-between gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 p-6 backdrop-blur-md transition-all hover:border-sky-500/40 md:flex-row md:items-center">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-md">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {item.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                item.status === "ACTIVE"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : item.status === "REJECTED"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {item.status === "ACTIVE" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {item.status === "PENDING" ? "Pending" : item.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold text-cyan-400">
              {isProperty ? "House/Lot" : "Store"}
            </span>
            <span>•</span>
            <span>
              Owner:{" "}
              <strong className="text-[var(--text-secondary)]">
                {item.owner}
              </strong>{" "}
              ({item.email})
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-tertiary)]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>{item.address || "No address provided"}</span>
          </div>
          {item.status === "REJECTED" && item.rejectionReason && (
            <p className="pt-2 text-xs text-rose-400">
              Reason: {item.rejectionReason}
            </p>
          )}
        </div>
      </div>
      {isPending && (
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border-light)] pt-4 md:border-t-0 md:pt-0">
          <Button
            type="button"
            disabled={isApproving || isRejecting}
            onClick={onApprove}
          >
            <CheckCircle2 className="h-4 w-4" /> Verify
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isApproving || isRejecting}
            onClick={onReject}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      )}
    </div>
  );
}
