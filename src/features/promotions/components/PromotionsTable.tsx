"use client";

import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Pencil, Trash2 } from "lucide-react";
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
                      className="rounded-full px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: chip.background, color: chip.color }}
                    >
                      {chip.label}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(promotion)}
                        className="rounded-lg p-1.5 hover:bg-[var(--background-tertiary)]"
                        aria-label="Edit"
                      >
                        <Pencil
                          className="h-4 w-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(promotion)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-1.5 hover:bg-[var(--background-tertiary)] disabled:opacity-60"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </button>
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
