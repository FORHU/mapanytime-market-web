"use client";

import { Award, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import { useAgentCommissionConfig } from "../hooks/useAdminAgentPayouts";

export function AgentCommissionConfigBanner() {
  const { data: config, isLoading, isError } = useAgentCommissionConfig();

  if (isError) {
    return null;
  }

  const ratePercent = config ? (config.commissionRate * 100).toFixed(2) : "0.05";
  const minPayoutFormatted = formatPeso(config?.payoutMinimum ?? 500);
  const holdDays = config?.eligibilityHoldDays ?? 7;

  return (
    <div className="p-4 sm:p-5 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
            <span>Recruiter Agent Incentive Program</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              Active
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Recruiter agents earn a recurring referral cut on every completed order from onboarded merchants.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--background-tertiary)]/60 border border-[var(--border-default)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
            Commission Rate
          </span>
          <span className="text-sm font-black text-[var(--text-primary)]">
            {isLoading ? "..." : `${ratePercent}% GMV`}
          </span>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--background-tertiary)]/60 border border-[var(--border-default)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
            Payout Minimum
          </span>
          <span className="text-sm font-black text-amber-400">
            {isLoading ? "..." : minPayoutFormatted}
          </span>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--background-tertiary)]/60 border border-[var(--border-default)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
            Maturation Hold
          </span>
          <span className="text-sm font-black text-[var(--text-primary)]">
            {isLoading ? "..." : `${holdDays} Days`}
          </span>
        </div>
      </div>
    </div>
  );
}
