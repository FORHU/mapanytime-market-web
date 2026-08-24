"use client";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Wallet, Receipt } from "lucide-react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useSellerEarnings } from "@/features/finance/hooks/useSellerEarnings";
import { formatPeso } from "@/shared/lib/currency";
import type {
  Settlement,
  SettlementStatus,
  Payout,
  PayoutStatus,
} from "@/features/finance/contracts/finance.contract";

const SETTLEMENT_BADGES: Record<SettlementStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HELD: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  RELEASED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REFUNDED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const PAYOUT_BADGES: Record<PayoutStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PROCESSING: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

function StatusBadge({ label, classes }: { label: string; classes: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SettlementRow({ settlement }: { settlement: Settlement }) {
  return (
    <div className="py-3 border-b border-[var(--border-light)] last:border-0 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          Order #{settlement.orderId.slice(0, 8)}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {formatDate(settlement.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
          {formatPeso(settlement.sellerNetAmount)}
        </p>
        <StatusBadge
          label={settlement.status}
          classes={SETTLEMENT_BADGES[settlement.status]}
        />
      </div>
    </div>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  return (
    <div className="py-3 border-b border-[var(--border-light)] last:border-0 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {payout.payoutNumber}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {formatDate(payout.createdAt)} · {payout.payoutMethod}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
          {formatPeso(payout.totalAmount)}
        </p>
        <StatusBadge
          label={payout.status}
          classes={PAYOUT_BADGES[payout.status]}
        />
      </div>
    </div>
  );
}

export default function SellerFinancePage() {
  const { userId, isHydrated } = useCurrentUser();
  const { settlements, payouts, summary, isLoading, isError } =
    useSellerEarnings(isHydrated ? userId : null);

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Earnings & payouts
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          What you&apos;ve earned from completed orders and what&apos;s been
          paid out.
        </p>
      </div>

      {isHydrated && !userId && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Sign in required
            </p>
          </CardContent>
        </Card>
      )}

      {userId && (isLoading || !isHydrated) && (
        <Card>
          <CardContent className="p-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[var(--background-tertiary)] animate-pulse"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {userId && !isLoading && isError && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Couldn&apos;t load your earnings right now.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Please try again in a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {userId && !isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card>
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Available for payout
                </span>
                <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">
                  {formatPeso(summary.availableAmount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Pending release
                </span>
                <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">
                  {formatPeso(summary.pendingAmount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Lifetime earnings
                </span>
                <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">
                  {formatPeso(summary.lifetimeAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-[var(--text-tertiary)]" />
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Recent settlements
                </h2>
              </div>
              {(settlements.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">
                  No settlements yet — they appear once a buyer&apos;s order is
                  completed.
                </p>
              ) : (
                settlements.data
                  ?.slice(0, 10)
                  .map((s) => <SettlementRow key={s.id} settlement={s} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-[var(--text-tertiary)]" />
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Payout history
                </h2>
              </div>
              {(payouts.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">
                  No payouts requested yet.
                </p>
              ) : (
                payouts.data?.map((p) => <PayoutRow key={p.id} payout={p} />)
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
