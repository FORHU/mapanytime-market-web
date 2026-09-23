import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { SectionHeading } from "./SectionHeading";
import {
  formatCount,
  formatPercentage,
  pickupCompletionRate,
  pickupTotal,
} from "../lib/derive";
import type { PickupPerformance } from "../contracts/seller-analytics.contract";

interface PickupPerformancePanelProps {
  pickup: PickupPerformance;
}

const OUTCOMES = [
  {
    key: "completed" as const,
    label: "Completed",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    hint: "Handed over to the buyer",
  },
  {
    key: "pending" as const,
    label: "Pending",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    hint: "Still waiting for pickup",
  },
  {
    key: "cancelled" as const,
    label: "Cancelled",
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    hint: "Called off before pickup",
  },
];

/**
 * How pickups resolved.
 *
 * A single parts-of-whole bar rather than three more stat tiles. The three
 * counts are shares of one number, and a segmented bar says that in a way that
 * three separate boxes do not. Every figure here is derived from the counts, so
 * the rate cannot drift out of step with the segments.
 */
export function PickupPerformancePanel({
  pickup,
}: PickupPerformancePanelProps) {
  const total = pickupTotal(pickup);
  const rate = pickupCompletionRate(pickup);

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Pickup performance"
        description="Every order in this period, by how it ended."
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums">
              {formatPercentage(rate)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              completion rate across {formatCount(total)} orders
            </span>
          </div>

          {/* One track split by share, not a progress bar on an empty track. */}
          <div
            className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={OUTCOMES.map(
              ({ key, label }) => `${label} ${formatCount(pickup[key])}`,
            ).join(", ")}
          >
            {OUTCOMES.map(({ key, bar }) => {
              const share = total > 0 ? (pickup[key] / total) * 100 : 0;
              if (share === 0) return null;
              return (
                <span
                  key={key}
                  className={bar}
                  style={{ width: `${share}%` }}
                />
              );
            })}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OUTCOMES.map(({ key, label, text, hint }) => (
              <div key={key} className="space-y-0.5">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {label}
                </dt>
                <dd className={`text-xl font-semibold tabular-nums ${text}`}>
                  {formatCount(pickup[key])}
                </dd>
                <dd className="text-xs text-[var(--text-secondary)]">{hint}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
