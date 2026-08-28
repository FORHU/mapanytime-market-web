"use client";

import {
  PlusCircle,
  Tag,
  Gift,
  RotateCcw,
  TimerOff,
  Undo2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useTransactions } from "../hooks/useRewards";
import type { RewardTransaction } from "../contracts/rewards.contract";

const meta: Record<
  RewardTransaction["type"],
  { label: string; icon: LucideIcon }
> = {
  EARN: { label: "Points earned", icon: PlusCircle },
  SPEND: { label: "Voucher claimed", icon: Tag },
  BONUS: { label: "Bonus points", icon: Gift },
  REFUND: { label: "Refund", icon: RotateCcw },
  EXPIRED: { label: "Points expired", icon: TimerOff },
  REVERSAL: { label: "Reversal", icon: Undo2 },
  ADJUSTMENT: { label: "Adjustment", icon: SlidersHorizontal },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The MapPoints ledger. No infinite-scroll pagination yet — a single
 * generous page covers the common case; add real paging if that stops
 * being true. */
export function TransactionList() {
  const { data, isLoading, isError } = useTransactions(1, undefined);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-sm text-[var(--text-secondary)]">
        Couldn&apos;t load your history.
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-sm text-[var(--text-secondary)]">
        No MapPoints activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((tx) => {
        const { label, icon: Icon } = meta[tx.type];
        const isPositive = tx.amount > 0;

        return (
          <div
            key={tx.id}
            className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-core)]/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[var(--brand-core)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                {label}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {formatDateTime(tx.createdAt)}
              </p>
            </div>
            <p
              className={`text-sm font-bold shrink-0 tabular-nums ${
                isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isPositive ? "+" : ""}
              {tx.amount} pts
            </p>
          </div>
        );
      })}
    </div>
  );
}
