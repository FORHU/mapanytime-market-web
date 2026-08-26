"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  useDeletePromotion,
  useTogglePromotion,
} from "../hooks/usePromotionMutations";
import type {
  Promotion,
  AdWindowState,
} from "../contracts/promotions.contract";
import {
  DEFAULT_TIME_ZONE,
  formatInZone,
  formatRelative,
  timeZoneAbbreviation,
} from "../lib/schedule";

const KIND_LABEL: Record<Promotion["kind"], string> = {
  PROMO: "Discount",
  EVENT: "Limited event",
  JOB: "Job posting",
};

const STATE_STYLE: Record<
  AdWindowState,
  { label: string; background: string; color: string }
> = {
  LIVE: {
    label: "Live",
    background: "rgba(16,185,129,0.15)",
    color: "#059669",
  },
  SCHEDULED: {
    label: "Scheduled",
    background: "rgba(59,130,246,0.15)",
    color: "#2563eb",
  },
  PAUSED: {
    label: "Paused",
    background: "rgba(245,158,11,0.15)",
    color: "#b45309",
  },
  ENDED: {
    label: "Ended",
    background: "var(--background-tertiary)",
    color: "var(--text-secondary)",
  },
};

/**
 * Falls back to deriving from the timestamps when the API hasn't been deployed
 * yet, so a web release that lands first still shows the right chip.
 */
function resolveState(promotion: Promotion, now: Date): AdWindowState {
  if (promotion.state) return promotion.state;
  if (promotion.expiresAt && now >= new Date(promotion.expiresAt))
    return "ENDED";
  if (promotion.startAt && now < new Date(promotion.startAt))
    return "SCHEDULED";
  if (!promotion.isActive) return "PAUSED";
  return "LIVE";
}

/** The question a seller opened this page to ask, answered in the row. */
function scheduleNote(promotion: Promotion, state: AdWindowState, now: Date) {
  if (state === "SCHEDULED" && promotion.startAt) {
    return `starts ${formatRelative(promotion.startAt, now)}`;
  }
  if (state === "LIVE" && promotion.expiresAt) {
    return `ends ${formatRelative(promotion.expiresAt, now)}`;
  }
  if (state === "LIVE") return "no end date";
  return null;
}

function discountSummary(promotion: Promotion) {
  if (
    promotion.discountType === "BOGO" &&
    promotion.buyQuantity &&
    promotion.freeQuantity
  ) {
    return `Buy ${promotion.buyQuantity}, get ${promotion.freeQuantity} free`;
  }
  if (promotion.discountType === "PERCENTAGE" && promotion.discountValue) {
    return `${promotion.discountValue}% off`;
  }
  if (promotion.discountType === "FIXED_AMOUNT" && promotion.discountValue) {
    return `₱${promotion.discountValue} off`;
  }
  return "—";
}

interface PromotionsTableProps {
  storeId: string;
  promotions: Promotion[];
  /** The API's clock, used to offset the browser's if it has drifted. */
  serverTime?: string | null;
  onEdit: (promotion: Promotion) => void;
}

export function PromotionsTable({
  storeId,
  promotions,
  serverTime,
  onEdit,
}: PromotionsTableProps) {
  const toggleMutation = useTogglePromotion(storeId);
  const deleteMutation = useDeletePromotion(storeId);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  useEffect(() => {
    if (!openMenuId) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId, closeMenu]);

  // Countdowns are measured against the server's clock, so a device running a
  // few minutes fast doesn't label a live promotion "starts in 3 minutes".
  const now = serverTime ? new Date(serverTime) : new Date();

  const handleToggle = (promotion: Promotion) => {
    toggleMutation.mutate(
      { id: promotion.id, isActive: !promotion.isActive },
      {
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Couldn't update"),
      },
    );
  };

  const handleDelete = (promotion: Promotion) => {
    if (!confirm(`Delete "${promotion.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(promotion.id, {
      onSuccess: () => toast.success("Promotion deleted"),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Couldn't delete promotion",
        ),
    });
  };

  return (
    <Card
      className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="px-4 py-3.5">Title</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Details</th>
              <th className="px-4 py-3.5">Schedule</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)] text-sm">
            {promotions.map((promotion) => {
              const state = resolveState(promotion, now);
              const chip = STATE_STYLE[state];
              const note = scheduleNote(promotion, state, now);
              const zone = promotion.storeTimezone ?? DEFAULT_TIME_ZONE;
              const zoneAbbr = timeZoneAbbreviation(zone);

              return (
                <tr key={promotion.id}>
                  <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">
                    {promotion.title}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">
                    {KIND_LABEL[promotion.kind]}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">
                    {promotion.kind === "JOB"
                      ? promotion.salaryLabel || "—"
                      : discountSummary(promotion)}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">
                    {promotion.startAt || promotion.expiresAt ? (
                      // Titled with the zone because a seller who owns stores in
                      // more than one will see rows whose identical-looking times
                      // mean different instants.
                      <div
                        className="space-y-0.5"
                        title={`Store time — ${zone}${zoneAbbr ? ` (${zoneAbbr})` : ""}`}
                      >
                        <div className="whitespace-nowrap">
                          {promotion.startAt
                            ? formatInZone(promotion.startAt, zone)
                            : "Started"}
                          {" → "}
                          {promotion.expiresAt
                            ? formatInZone(promotion.expiresAt, zone)
                            : "no end"}
                        </div>
                        {note && (
                          <div className="text-xs text-[var(--text-tertiary)]">
                            {note}
                          </div>
                        )}
                      </div>
                    ) : (
                      "Always on"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {/* State is encoded in colour as well as text, so the running
                      promotions are findable at a glance in a long list. The
                      button pauses and resumes; it no longer implies it controls
                      whether the promotion exists. */}
                    <button
                      onClick={() => handleToggle(promotion)}
                      disabled={toggleMutation.isPending || state === "ENDED"}
                      title={
                        state === "ENDED"
                          ? "This promotion has ended. Change its end time to run it again."
                          : promotion.isActive
                            ? "Pause this promotion"
                            : "Resume this promotion"
                      }
                      // Updated classes below:
                      className="cursor-pointer rounded-full border border-black/10 px-3 py-1 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md hover:brightness-95 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10"
                      style={{ background: chip.background, color: chip.color }}
                    >
                      {chip.label}
                    </button>
                  </td>
                  <td className="px-4 py-4 relative">
                    <div className="flex items-center justify-end">
                      <div
                        className="relative"
                        ref={openMenuId === promotion.id ? menuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === promotion.id ? null : promotion.id,
                            )
                          }
                          aria-label="More actions"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === promotion.id}
                          className="rounded-lg p-1.5 hover:bg-[var(--background-tertiary)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === promotion.id && (
                          <div
                            role="menu"
                            aria-label="Promotion actions"
                            className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border bg-[var(--background-primary)] py-1 shadow-xl"
                            style={{ borderColor: "var(--border-light)" }}
                          >
                            <button
                              role="menuitem"
                              onClick={() => {
                                closeMenu();
                                onEdit(promotion);
                              }}
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                closeMenu();
                                handleDelete(promotion);
                              }}
                              disabled={deleteMutation.isPending}
                              className="flex w-full items-center gap-2.5 border-t border-[var(--border-light)] px-3.5 py-2.5 text-left text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
