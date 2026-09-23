import React from "react";
import { CheckCircle2, Clock, XCircle, Wallet } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import { SectionHeading } from "./SectionHeading";
import { StatTile } from "./StatTile";
import { formatCount, onlinePaymentCount } from "../lib/derive";
import type { XenditSummary } from "../contracts/seller-analytics.contract";

interface XenditSummaryPanelProps {
  summary: XenditSummary;
  /** Used to explain how many orders were paid in cash instead. */
  totalOrders: number;
}

export function XenditSummaryPanel({
  summary,
  totalOrders,
}: XenditSummaryPanelProps) {
  const online = onlinePaymentCount(summary);
  const cashOnPickup = Math.max(0, totalOrders - online);

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Xendit payments"
        description={`${formatCount(online)} of ${formatCount(totalOrders)} orders were paid online. The other ${formatCount(cashOnPickup)} were cash on pickup.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Successful"
          value={formatCount(summary.successfulPayments)}
          hint="Settled to your balance"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatTile
          label="Pending"
          value={formatCount(summary.pendingPayments)}
          hint="Awaiting buyer confirmation"
          icon={Clock}
          accent="amber"
        />
        <StatTile
          label="Failed"
          value={formatCount(summary.failedPayments)}
          hint="Buyer can retry checkout"
          icon={XCircle}
          accent="rose"
        />
        <StatTile
          label="Online revenue"
          value={formatPeso(summary.onlinePaymentRevenue)}
          hint="Through Xendit only"
          icon={Wallet}
          accent="sky"
        />
      </div>
    </section>
  );
}
