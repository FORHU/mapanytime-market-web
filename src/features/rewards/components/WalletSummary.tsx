"use client";

import { Coins } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import { useWallet } from "../hooks/useRewards";

/** Balance + estimated peso value header, shared across the rewards page. */
export function WalletSummary() {
  const { data: wallet, isLoading, isError } = useWallet();

  if (isLoading) {
    return (
      <div className="h-24 rounded-2xl bg-[var(--brand-core)]/20 animate-pulse" />
    );
  }

  if (isError || !wallet) {
    return (
      <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-sm text-[var(--text-secondary)]">
        Couldn&apos;t load your MapPoints balance.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[var(--brand-core)] text-white flex items-start justify-between gap-4">
      <div>
        <p className="text-3xl font-black tracking-tight">
          {wallet.balance} pts
        </p>
        <p className="text-sm text-white/80 mt-1">
          &asymp; {formatPeso(wallet.estimatedValuePhp)} in vouchers
        </p>
      </div>
      <Coins className="w-8 h-8 text-white/70 shrink-0" />
    </div>
  );
}
