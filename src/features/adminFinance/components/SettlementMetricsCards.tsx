"use client";

import {
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  Banknote,
  ShieldAlert,
} from "lucide-react";
import { AdminSettlementSummary } from "../contracts/adminSettlement.contract";
import { formatPeso } from "@/shared/lib/currency";

interface SettlementMetricsCardsProps {
  summary: AdminSettlementSummary | null | undefined;
  isLoading: boolean;
  error?: string | null;
}

export function SettlementMetricsCards({
  summary,
  isLoading,
  error,
}: SettlementMetricsCardsProps) {
  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Failed to load financial summary: {error}</span>
      </div>
    );
  }

  const cards = [
    {
      title: "Gross Sales (GMV)",
      value: formatPeso(summary?.totalSales),
      subtitle: `${summary?.totalSettlements ?? 0} settled orders`,
      icon: TrendingUp,
      accent: "text-sky-400",
      bgLight: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Platform Fees Earned",
      value: formatPeso(summary?.totalCommission),
      subtitle: "Seller marketplace fee revenue",
      icon: Percent,
      accent: "text-emerald-400",
      bgLight: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Funds Held in Return Window",
      value: formatPeso(summary?.pendingAmount),
      subtitle: `${summary?.holdDays ?? 7}-day return safety buffer`,
      icon: Clock,
      accent: "text-amber-400",
      bgLight: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Available for Payout",
      value: formatPeso(summary?.availableAmount),
      subtitle: "Matured balances ready for sweep",
      icon: CheckCircle2,
      accent: "text-cyan-400",
      bgLight: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Cash Commissions Due",
      value: formatPeso(summary?.cashCommissionOwed),
      subtitle: "Net off next seller payout run",
      icon: Banknote,
      accent: "text-purple-400",
      bgLight: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-3 relative overflow-hidden transition-all hover:border-[var(--brand-core)]/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {c.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${c.bgLight} border flex items-center justify-center ${c.accent}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-1">
                <div className="h-6 w-24 rounded-lg bg-[var(--background-tertiary)] animate-pulse" />
                <div className="h-3 w-32 rounded bg-[var(--background-tertiary)] animate-pulse" />
              </div>
            ) : (
              <div>
                <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {c.value}
                </p>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 truncate">
                  {c.subtitle}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
