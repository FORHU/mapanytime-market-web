"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  History,
  Home,
  LandPlot,
  MapPin,
  PencilLine,
  Search,
  Store,
  Undo2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { ClampedNote } from "@/shared/components/ui/ClampedNote";
import { useApprovals } from "@/features/adminApprovals/hooks/useApprovals";
import { useApprovalActions } from "@/features/adminApprovals/hooks/useApprovalActions";
import { useApprovalHistory } from "@/features/adminApprovals/hooks/useApprovalHistory";
import {
  ReviewNoteDialog,
  type ReviewIntent,
} from "@/features/adminApprovals/components/ReviewNoteDialog";
import type {
  ApprovalItem,
  ApprovalStatus,
} from "@/features/adminApprovals/contracts/approval.contract";

type ApprovalFilter = "ALL" | ApprovalStatus;

/**
 * The queue tabs, in the order an administrator works them.
 *
 * "Unclaimed" rather than "Pending": once a claim exists the two are different
 * kinds of waiting, and the label has to say which. DRAFT is last because a
 * property the seller has not submitted is not review work at all — it is here
 * only so it stops hiding inside the pending count.
 */
const FILTERS: { value: ApprovalFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "NEEDS_REVISION", label: "Needs revision" },
  { value: "ACTIVE", label: "Active" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
];

const STATUS_META: Record<
  ApprovalStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    Icon: FileEdit,
  },
  PENDING: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    Icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under review",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    Icon: Eye,
  },
  NEEDS_REVISION: {
    label: "Needs revision",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    Icon: PencilLine,
  },
  ACTIVE: {
    label: "Active",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    Icon: XCircle,
  },
};

/**
 * Which note dialog is open, and therefore which endpoint it submits to.
 * Owned by the dialog, since the reviewer can switch between the two from
 * inside it.
 */
type NoteIntent = ReviewIntent;

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function AdminStoresPage() {
  const [activeFilter, setActiveFilter] = useState<ApprovalFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteTarget, setNoteTarget] = useState<{
    item: ApprovalItem;
    intent: NoteIntent;
  } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { data: approvals = [], isLoading, isError, error } = useApprovals();
  const { approve, reject, claim, release, revise } = useApprovalActions();

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

  const closeNoteModal = () => setNoteTarget(null);

  /**
   * The note itself lives in the dialog — the page only needs to know which
   * store and which decision, so it can pick the mutation.
   */
  const handleSubmitNote = (note: string) => {
    if (!noteTarget || note.length < 3) return;

    const mutation = noteTarget.intent === "reject" ? reject : revise;
    const payload =
      noteTarget.intent === "reject"
        ? { item: noteTarget.item, reason: note }
        : { item: noteTarget.item, notes: note };

    // Both mutations take {item, reason|notes}; the union is narrowed by intent
    // above, so this cast only reunites the two branches for the call.
    (mutation.mutate as (vars: unknown, opts?: unknown) => void)(payload, {
      onSuccess: closeNoteModal,
    });
  };

  const withProcessing = useCallback(
    (item: ApprovalItem, run: () => void) => {
      const key = `${item.entityType}:${item.id}`;
      if (processingIds.has(key)) return;
      setProcessingIds((prev) => new Set(prev).add(key));
      run();
      // Cleared on settle by each caller's onSettled; this only guards the
      // double-click window before the request is in flight.
      window.setTimeout(
        () =>
          setProcessingIds((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          }),
        1200,
      );
    },
    [processingIds],
  );

  const handleApprove = useCallback(
    (item: ApprovalItem) => withProcessing(item, () => approve.mutate(item)),
    [approve, withProcessing],
  );

  /**
   * Claim, or offer a takeover.
   *
   * The refusal carries the current holder's name, so the confirm can say who
   * is being interrupted rather than asking the admin to override an anonymous
   * lock.
   */
  const handleClaim = useCallback(
    (item: ApprovalItem) => {
      withProcessing(item, () =>
        claim.mutate(
          { item },
          {
            onError: (err: unknown) => {
              const apiError = err as {
                code?: string;
                details?: { claimedByName?: string };
              };
              if (apiError?.code !== "ALREADY_CLAIMED") return;

              const holder = apiError.details?.claimedByName ?? "another admin";
              if (
                window.confirm(
                  `${holder} is already reviewing ${item.name}. Take over the review?`,
                )
              ) {
                claim.mutate({ item, force: true });
              }
            },
          },
        ),
      );
    },
    [claim, withProcessing],
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
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeFilter === filter.value
                  ? "bg-[var(--brand-core)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
              }`}
            >
              {filter.label} (
              {filter.value === "ALL"
                ? approvals.length
                : approvals.filter((item) => item.status === filter.value)
                    .length}
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
                isBusy={
                  processingIds.has(itemKey) ||
                  approve.isPending ||
                  reject.isPending ||
                  revise.isPending ||
                  claim.isPending ||
                  release.isPending
                }
                onClaim={() => handleClaim(item)}
                onRelease={() => release.mutate(item)}
                onApprove={() => handleApprove(item)}
                onReject={() => setNoteTarget({ item, intent: "reject" })}
                onRequestRevision={() =>
                  setNoteTarget({ item, intent: "revise" })
                }
              />
            );
          })}
        </div>
      )}

      {noteTarget && (
        <ReviewNoteDialog
          item={noteTarget.item}
          intent={noteTarget.intent}
          // Switching modes keeps the dialog mounted, so whatever the reviewer
          // has already written survives the change of mind.
          onIntentChange={(intent) =>
            setNoteTarget((current) =>
              current ? { ...current, intent } : current,
            )
          }
          isPending={reject.isPending || revise.isPending}
          onSubmit={handleSubmitNote}
          onCancel={closeNoteModal}
        />
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  isBusy,
  onClaim,
  onRelease,
  onApprove,
  onReject,
  onRequestRevision,
}: {
  item: ApprovalItem;
  isBusy: boolean;
  onClaim: () => void;
  onRelease: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
}) {
  const isProperty = item.entityType === "PROPERTY";
  const Icon = isProperty
    ? item.propertyType === "RAW_LAND"
      ? LandPlot
      : Home
    : Store;

  const meta = STATUS_META[item.status];
  const StatusIcon = meta.Icon;

  return (
    <div className="flex flex-col justify-between gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 p-6 backdrop-blur-md transition-all hover:border-sky-500/40 md:flex-row md:items-center">
      {/* min-w-0 on both: flex items default to `min-width: auto`, so without
          it an unbreakable store name or note sets the track's width and drags
          the whole page into horizontal scroll. */}
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-md">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="break-words text-lg font-bold text-[var(--text-primary)]">
              {item.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </span>
            {item.claimedBy && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">
                <UserCheck className="h-3 w-3" />
                {item.claimedBy.name} · {relativeTime(item.claimedAt)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold text-cyan-400">
              {isProperty ? "House/Lot" : "Store"}
            </span>
            <span>•</span>
            <span className="min-w-0 break-words">
              Owner:{" "}
              <strong className="text-[var(--text-secondary)]">
                {item.owner}
              </strong>{" "}
              ({item.email})
            </span>
          </div>
          <div className="flex items-start gap-2 pt-1 text-xs text-[var(--text-tertiary)]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span className="min-w-0 break-words">
              {item.address || "No address provided"}
            </span>
          </div>
          {item.status === "REJECTED" && item.rejectionReason && (
            <ClampedNote
              label="Reason"
              text={item.rejectionReason}
              tone="danger"
            />
          )}
          {item.status === "NEEDS_REVISION" && item.revisionNotes && (
            <ClampedNote
              label="Requested"
              text={item.revisionNotes}
              tone="warning"
            />
          )}
          {item.entityType === "STORE" && <ReviewHistory storeId={item.id} />}
        </div>
      </div>

      <ApprovalActions
        item={item}
        isBusy={isBusy}
        onClaim={onClaim}
        onRelease={onRelease}
        onApprove={onApprove}
        onReject={onReject}
        onRequestRevision={onRequestRevision}
      />
    </div>
  );
}

/**
 * The review timeline, collapsed by default.
 *
 * Collapsed because the queue is a scanning surface — a reviewer wants to see
 * ten submissions at once, not ten histories. Fetched only on open, so an
 * unopened panel costs nothing.
 *
 * A store that has been round more than once is exactly where this earns its
 * place: the single `revisionNotes` column only holds the latest ask, and
 * "third time asking for the same permit" is not visible anywhere else.
 */
function ReviewHistory({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false);
  const { data: history = [], isLoading } = useApprovalHistory(
    open ? storeId : null,
  );

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={(event) => {
          // The card itself is not clickable, but keeping this contained
          // matches the buttons beside it and guards against that changing.
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <History className="h-3 w-3" />
        {open ? "Hide review history" : "Review history"}
      </button>

      {open && (
        <div className="mt-2 space-y-2 border-l border-[var(--border-light)] pl-3">
          {isLoading && (
            <p className="text-[11px] text-[var(--text-tertiary)]">Loading…</p>
          )}
          {!isLoading && history.length === 0 && (
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Nothing recorded yet.
            </p>
          )}
          {history.map((entry) => (
            <div key={entry.id} className="min-w-0 text-[11px]">
              <span className="font-semibold text-[var(--text-secondary)]">
                {entry.from && entry.to && entry.from !== entry.to
                  ? `${STATUS_META[entry.from as ApprovalStatus]?.label ?? entry.from} → ${
                      STATUS_META[entry.to as ApprovalStatus]?.label ?? entry.to
                    }`
                  : "Review claim reassigned"}
              </span>
              <span className="text-[var(--text-tertiary)]">
                {" "}
                · {entry.actorName ?? "Unknown"} ·{" "}
                {relativeTime(entry.createdAt)}
              </span>
              {entry.note && (
                // No clamp here: someone who opened the history wants the whole
                // note. It only has to wrap.
                <p className="mt-0.5 break-words text-[var(--text-tertiary)]">
                  “{entry.note}”
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What an admin can do, given where the item is.
 *
 * Properties keep the old approve/reject pair — they have no claim workflow —
 * so only stores get the three-way decision, and only once claimed. That is
 * enforced by the transition matrix on the API; these buttons just avoid
 * offering a click that would come back 409.
 */
function ApprovalActions({
  item,
  isBusy,
  onClaim,
  onRelease,
  onApprove,
  onReject,
  onRequestRevision,
}: {
  item: ApprovalItem;
  isBusy: boolean;
  onClaim: () => void;
  onRelease: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
}) {
  const wrapper =
    "flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-light)] pt-4 md:border-t-0 md:pt-0";

  if (item.entityType === "PROPERTY") {
    if (item.status !== "PENDING") return null;
    return (
      <div className={wrapper}>
        <Button type="button" disabled={isBusy} onClick={onApprove}>
          <CheckCircle2 className="h-4 w-4" /> Verify
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={onReject}
        >
          <XCircle className="h-4 w-4" /> Reject
        </Button>
      </div>
    );
  }

  switch (item.status) {
    case "PENDING":
      return (
        <div className={wrapper}>
          <Button type="button" disabled={isBusy} onClick={onClaim}>
            <Eye className="h-4 w-4" /> Claim &amp; review
          </Button>
        </div>
      );

    case "UNDER_REVIEW":
      return (
        <div className={wrapper}>
          <Button type="button" disabled={isBusy} onClick={onApprove}>
            <CheckCircle2 className="h-4 w-4" /> Approve
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={onRequestRevision}
          >
            <PencilLine className="h-4 w-4" /> Request changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={onReject}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={onRelease}
          >
            <Undo2 className="h-4 w-4" /> Release
          </Button>
        </div>
      );

    case "NEEDS_REVISION":
      return (
        <p className="shrink-0 text-xs text-[var(--text-tertiary)]">
          Waiting on the seller to resubmit.
        </p>
      );

    // An approved or rejected store is not queue work, but both can be reopened
    // — a takedown, or an appeal that should not cost the seller a fresh
    // application.
    case "ACTIVE":
    case "REJECTED":
      return (
        <div className={wrapper}>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={onClaim}
          >
            <Eye className="h-4 w-4" />
            {item.status === "ACTIVE" ? "Re-review" : "Reopen"}
          </Button>
        </div>
      );

    default:
      return null;
  }
}
