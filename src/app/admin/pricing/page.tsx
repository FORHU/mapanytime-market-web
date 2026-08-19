"use client";

import React, { useMemo, useState } from "react";
import {
  Coins,
  ShieldCheck,
  CreditCard,
  Percent,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Settings2,
  Plus,
  RefreshCw,
  Info,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  useActivePricing,
  usePricingSimulation,
} from "@/features/pricing/hooks/pricing.hooks";
import {
  isFallbackPricing,
  type PayerPolicy,
} from "@/features/pricing/contracts/pricing.contract";

interface PricingComponentRow {
  id: string;
  name: string;
  type: string;
  rate: number;
  fixed: number;
  target: string;
  isActive: boolean;
}

const COMPONENT_LABELS: Record<string, string> = {
  SELLER_MARKETPLACE_FEE: "Seller Marketplace Commission",
  BUYER_TRANSACTION_FEE: "Buyer Platform Handling Fee",
  PAYMENT_PROCESSING_FEE: "Payment Gateway Processing Cost",
  FIXED_TRANSACTION_FEE: "Fixed Transaction Fee",
  WITHDRAWAL_FEE: "Withdrawal Fee",
  ADVERTISING_FEE: "Advertising Fee",
};

const peso = (n: number) => `₱${n.toFixed(2)}`;
const percent = (rate: number) => `${(rate * 100).toFixed(2)}%`;

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "components" | "simulator"
  >("overview");
  const [payerPolicy, setPayerPolicy] = useState<PayerPolicy>("BUYER");

  // Simulator states
  const [simOrderAmount, setSimOrderAmount] = useState<number>(1000);
  const [simPaymentMethod, setSimPaymentMethod] = useState<
    "GCASH" | "CARD" | "CASH"
  >("GCASH");

  const {
    data: activePricing,
    isLoading: isPricingLoading,
    isError: isPricingError,
  } = useActivePricing();

  // Every figure below comes back from the API's pricing engine. Recomputing it
  // here would let the admin view and checkout disagree.
  const {
    data: sim,
    isLoading: isSimLoading,
    isError: isSimError,
  } = usePricingSimulation({
    subtotalAmount: simOrderAmount,
    paymentMethodCode: simPaymentMethod,
    paymentFeePayerPolicy: payerPolicy,
  });

  const usingFallbackRates =
    !!activePricing && isFallbackPricing(activePricing);

  const planName = activePricing?.name ?? "—";
  const planStatus = activePricing?.status ?? "UNKNOWN";
  const planCurrency = activePricing?.currency ?? "PHP";
  const planEffectiveFrom =
    activePricing && !isFallbackPricing(activePricing)
      ? new Date(activePricing.effectiveFrom).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })
      : null;

  const components: PricingComponentRow[] = useMemo(() => {
    if (!activePricing || isFallbackPricing(activePricing)) return [];
    return activePricing.components.map((c) => ({
      id: c.id,
      name: COMPONENT_LABELS[c.type] ?? c.type,
      type: c.type,
      rate: Number(c.ratePercentage ?? 0),
      fixed: Number(c.fixedAmount ?? 0),
      target:
        c.paymentMethod?.name ??
        c.provider?.name ??
        (c.storeId ? "Single store" : null) ??
        (c.sellerPlan ? `${c.sellerPlan} plan` : null) ??
        (c.categoryId ? "Single category" : null) ??
        "All / Global",
      isActive: c.isActive,
    }));
  }, [activePricing]);

  /** Headline rate for a component type, falling back to the engine defaults. */
  const rateFor = (type: string, fallback: number | undefined) => {
    const match = components.find((c) => c.type === type);
    if (match) return percent(match.rate);
    return fallback === undefined ? "—" : percent(fallback);
  };

  const fallback = usingFallbackRates
    ? (activePricing as Extract<
        typeof activePricing,
        { defaultSellerCommission: number }
      >)
    : undefined;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-light)] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Pricing & Fee Engine
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Centralized, versioned marketplace commission and payment
                provider fee controls.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--background-secondary)] border border-[var(--border-light)] rounded-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-[var(--brand-core)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Active Plan
          </button>
          <button
            onClick={() => setActiveTab("components")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "components"
                ? "bg-[var(--brand-core)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Fee Components ({components.length})
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "simulator"
                ? "bg-[var(--brand-core)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Live Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ACTIVE CONFIGURATION */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Active Container Card */}
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-sky-950/40 via-slate-900/50 to-cyan-950/20 backdrop-blur-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      usingFallbackRates
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        usingFallbackRates
                          ? "bg-amber-400"
                          : "bg-emerald-400 animate-pulse"
                      }`}
                    />
                    {isPricingLoading
                      ? "LOADING CONFIGURATION"
                      : isPricingError
                        ? "CONFIGURATION UNAVAILABLE"
                        : usingFallbackRates
                          ? "NO STORED PLAN — ENGINE DEFAULTS"
                          : `${planStatus} CONFIGURATION`}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    {planCurrency}
                    {planEffectiveFrom
                      ? ` · Effective ${planEffectiveFrom}`
                      : ""}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  {isPricingLoading ? "Loading…" : planName}
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Versioned single source of truth for marketplace revenue and
                  gateway expense. Dynamically resolves buyer transaction fees
                  and calculates unalterable financial snapshots at checkout.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* The API exposes GET /pricing/active and POST /pricing/configurations
                    but no update endpoint, so the policy selector below is a
                    preview control until one exists. */}
                <button
                  disabled
                  title="Editing the active plan needs an update endpoint on the API"
                  className="px-4 py-2 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border-light)] text-[var(--text-tertiary)] font-bold text-xs flex items-center gap-2 cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Save & Sync Active Plan
                </button>
              </div>
            </div>

            {/* Core Pillars KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Seller Commission
                </span>
                <span className="text-2xl font-black text-cyan-400 mt-1 block">
                  {rateFor(
                    "SELLER_MARKETPLACE_FEE",
                    fallback?.defaultSellerCommission,
                  )}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  MapAnytime Marketplace Revenue
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Buyer Platform Fee
                </span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">
                  {rateFor(
                    "BUYER_TRANSACTION_FEE",
                    fallback?.defaultBuyerPlatformFee,
                  )}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Platform Processing Margin
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Gateway Cost (PayMongo)
                </span>
                <span className="text-2xl font-black text-rose-400 mt-1 block">
                  {rateFor(
                    "PAYMENT_PROCESSING_FEE",
                    fallback?.defaultGatewayProcessingFee,
                  )}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Incurred Provider Expense
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Payer Policy
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {payerPolicy}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {payerPolicy === "BUYER"
                    ? "Buyer pays provider fee"
                    : payerPolicy === "PLATFORM"
                      ? "Platform absorbs provider fee"
                      : "Shared 50/50 split"}
                </span>
              </div>
            </div>
          </div>

          {/* Policy Settings Section */}
          <div className="p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  Global Payment Fee Payer Policy (`PAYMENTFEEPAYER`)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Determines who covers the payment provider processing cost at
                  checkout. Selecting a policy here previews it in the
                  simulator; it is not yet persisted.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {[
                {
                  id: "BUYER",
                  title: "BUYER (Default)",
                  desc: "Buyer pays gateway cost (2.00%) + platform fee (0.23%) = 2.23%.",
                },
                {
                  id: "PLATFORM",
                  title: "PLATFORM",
                  desc: "MapAnytime absorbs payment gateway cost. Buyer pays ₱0 fee.",
                },
                {
                  id: "SHARED",
                  title: "SHARED (50/50)",
                  desc: "Buyer and MapAnytime split the gateway cost equally.",
                },
                {
                  id: "SELLER",
                  title: "SELLER",
                  desc: "Gateway cost is deducted from seller settlement.",
                },
              ].map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => setPayerPolicy(policy.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    payerPolicy === policy.id
                      ? "border-cyan-400 bg-cyan-400/10 shadow-sm"
                      : "border-[var(--border-light)] hover:border-[var(--border-default)] bg-[var(--background-tertiary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {policy.title}
                    </span>
                    {payerPolicy === policy.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {policy.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPONENTS LIST */}
      {activeTab === "components" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              Active components attached to this plan container
            </span>
            <button
              disabled
              title="Not wired yet — needs POST /pricing/configurations to accept a single component"
              className="px-3 py-1.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border-light)] text-[var(--text-tertiary)] text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Component
            </button>
          </div>

          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-light)] bg-[var(--background-tertiary)] text-[var(--text-secondary)] font-bold">
                <tr>
                  <th className="p-4">Component Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Rate (%)</th>
                  <th className="p-4">Fixed Fee</th>
                  <th className="p-4">Target Scope</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] text-[var(--text-primary)]">
                {components.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-[var(--background-tertiary)]/50 transition-colors"
                  >
                    <td className="p-4 font-bold">{comp.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          comp.type === "SELLER_MARKETPLACE_FEE"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : comp.type === "BUYER_TRANSACTION_FEE"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {comp.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-sky-400">
                      {percent(comp.rate)}
                    </td>
                    <td className="p-4 font-mono">{peso(comp.fixed)}</td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {comp.target}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                          comp.isActive
                            ? "text-emerald-400"
                            : "text-[var(--text-tertiary)]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            comp.isActive
                              ? "bg-emerald-400"
                              : "bg-[var(--text-tertiary)]"
                          }`}
                        />
                        {comp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {components.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-[var(--text-secondary)]"
                    >
                      {isPricingLoading
                        ? "Loading components…"
                        : isPricingError
                          ? "Could not reach the pricing API."
                          : "No stored pricing configuration. Checkout is using the engine's built-in default rates."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Inputs */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] space-y-5">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                Live Transaction Simulator
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Simulate checkout economics, platform gross revenue, gateway
                cost, and seller settlements.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                  Order Item Subtotal (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-tertiary)]">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={simOrderAmount}
                    onChange={(e) =>
                      setSimOrderAmount(Math.max(1, Number(e.target.value)))
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--background-tertiary)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "GCASH", label: "GCash" },
                    { id: "CARD", label: "Card" },
                    { id: "CASH", label: "Cash" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSimPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        simPaymentMethod === m.id
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                          : "border-[var(--border-light)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                  Fee Policy Override
                </label>
                <select
                  value={payerPolicy}
                  onChange={(e) => setPayerPolicy(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--background-tertiary)] text-xs font-bold text-[var(--text-primary)]"
                >
                  <option value="BUYER">
                    BUYER (Buyer absorbs provider fee)
                  </option>
                  <option value="PLATFORM">
                    PLATFORM (MapAnytime absorbs fee)
                  </option>
                  <option value="SHARED">SHARED (50/50 Split)</option>
                  <option value="SELLER">SELLER (Seller absorbs fee)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Simulator Visual Waterfall Breakdown */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-cyan-500/20 bg-[var(--background-secondary)] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">
                Simulated Accounting Waterfall
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                {isSimLoading
                  ? "Calculating…"
                  : isSimError
                    ? "Engine unavailable"
                    : `Policy: ${payerPolicy}`}
              </span>
            </div>

            <div className="space-y-3">
              {/* Buyer Breakdown */}
              <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border-light)] space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Buyer Side (Checkout Total)
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">
                    Product Items:
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {sim ? peso(sim.subtotalAmount) : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">
                    Payment Fee
                    {sim
                      ? ` (${percent(sim.buyerTransactionFee.effectiveRatePercentage)})`
                      : ""}
                    :
                  </span>
                  <span className="font-bold text-amber-400">
                    {sim
                      ? `+${peso(sim.buyerTransactionFee.totalBuyerFeeAmount)}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border-light)]">
                  <span className="text-white">Buyer Pays:</span>
                  <span className="text-emerald-400">
                    {sim ? peso(sim.buyerTotalAmount) : "—"}
                  </span>
                </div>
              </div>

              {/* Platform Ledger */}
              <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border-light)] space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Platform Revenue vs Payment Cost
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">
                    Marketplace Commission
                    {sim
                      ? ` (${percent(sim.sellerMarketplaceCommission.rate)})`
                      : ""}
                    :
                  </span>
                  <span className="font-bold text-cyan-400">
                    {sim
                      ? `+${peso(sim.sellerMarketplaceCommission.amount)}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">
                    Actual Gateway Cost ({simPaymentMethod}):
                  </span>
                  <span className="font-bold text-rose-400">
                    {sim
                      ? `-${peso(sim.paymentProcessingCost.calculatedCost)}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border-light)]">
                  <span className="text-white">Net MapAnytime Revenue:</span>
                  <span className="text-cyan-300">
                    {sim ? peso(sim.platformNetRevenue) : "—"}
                  </span>
                </div>
              </div>

              {/* Seller Net */}
              <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border-light)] space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Seller Settlement
                </span>
                <div className="flex justify-between text-sm font-black">
                  <span className="text-white">Seller Receives:</span>
                  <span className="text-sky-400">
                    {sim ? peso(sim.sellerNetAmount) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
