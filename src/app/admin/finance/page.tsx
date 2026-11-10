"use client";

import { useState } from "react";
import { Banknote, ShieldCheck, RefreshCw, Store, Users } from "lucide-react";
import {
  SettlementMetricsCards,
} from "@/features/adminFinance/components/SettlementMetricsCards";
import {
  SellerSettlementsTable,
} from "@/features/adminFinance/components/SellerSettlementsTable";
import { useAdminSettlementSummary } from "@/features/adminFinance/hooks/useAdminSettlement";
import {
  AgentPayoutsTable,
} from "@/features/adminAgentPayouts/components/AgentPayoutsTable";
import {
  AgentCommissionConfigBanner,
} from "@/features/adminAgentPayouts/components/AgentCommissionConfigBanner";

type FinanceTab = "sellers" | "agents";

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("sellers");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useAdminSettlementSummary(dateRange);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Financial Oversight
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Platform GMV, 7-day return safety holds, payable seller balances,
            and recruiter agent referral commission disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>7-Day Return Buffer Enforced</span>
          </div>

          <button
            type="button"
            onClick={() => refetchSummary()}
            disabled={isSummaryLoading || isSummaryFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)]/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isSummaryFetching ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Section */}
      <section className="space-y-3" aria-labelledby="metrics-heading">
        <h2
          id="metrics-heading"
          className="text-sm font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
        >
          Settlement Reserves & Performance
        </h2>
        <SettlementMetricsCards
          summary={summary}
          isLoading={isSummaryLoading}
          error={summaryError ? summaryError.message : null}
        />
      </section>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-default)] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("sellers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "sellers"
              ? "bg-[var(--brand-core)] text-white shadow-md"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Seller Settlements & Balances</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "agents"
              ? "bg-[var(--brand-core)] text-white shadow-md"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Recruiter Agent Payouts</span>
        </button>
      </div>

      {/* Content Tabs */}
      {activeTab === "sellers" ? (
        <section className="space-y-4" aria-labelledby="sellers-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="sellers-heading"
                className="text-lg font-black text-[var(--text-primary)] tracking-tight"
              >
                Seller Balances & Maturity Schedule
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Per-store balances broken down by gross GMV, pending dispute
                holds, sweep-eligible funds, and cash fee deductions.
              </p>
            </div>
          </div>

          <SellerSettlementsTable />
        </section>
      ) : (
        <section className="space-y-6" aria-labelledby="agents-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="agents-heading"
                className="text-lg font-black text-[var(--text-primary)] tracking-tight"
              >
                Recruiter Agent Commissions & Payouts
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Review and approve payout disbursements for onboarding agents,
                with automatic refund on rejected requests.
              </p>
            </div>
          </div>

          <AgentCommissionConfigBanner />
          <AgentPayoutsTable />
        </section>
      )}
    </div>
  );
}
