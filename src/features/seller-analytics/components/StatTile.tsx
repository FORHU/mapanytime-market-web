import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

/**
 * Accent tones for the icon badge. These mirror the `accent` strings in the
 * seller dashboard's `stats` array, which is the established tile style.
 * Palette utilities are the one place that needs explicit `dark:` pairs; the
 * surface and text tokens switch on their own.
 */
const ACCENTS = {
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  neutral: "bg-[var(--background-tertiary)] text-[var(--text-secondary)]",
} as const;

export type StatTileAccent = keyof typeof ACCENTS;

interface StatTileProps {
  label: string;
  value: string;
  /** One short line under the value. Optional, but keeps tiles the same height. */
  hint?: string;
  icon: LucideIcon;
  accent?: StatTileAccent;
  /** Percentage change against the preceding window. Omit to hide the row. */
  change?: number;
  /**
   * Present so that swapping the fixture for a real query needs no
   * restructuring here.
   */
  isLoading?: boolean;
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = "sky",
  change,
  isLoading = false,
}: StatTileProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <span className="block h-8 w-24 rounded-md bg-[var(--background-tertiary)] animate-pulse" />
        ) : (
          <span className="text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            {value}
          </span>
        )}

        {hint && !isLoading && (
          <span className="text-xs text-[var(--text-secondary)] block mt-1">
            {hint}
          </span>
        )}

        {change !== undefined && !isLoading && (
          <span
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              change >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            {change >= 0 ? `+${change}%` : `${change}%`} vs previous period
          </span>
        )}
      </div>
    </Card>
  );
}
