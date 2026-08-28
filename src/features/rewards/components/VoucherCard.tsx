"use client";

import { Tag, Coins } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import type { RewardVoucher } from "../contracts/rewards.contract";

export function discountSummary(voucher: RewardVoucher): string {
  if (voucher.discountType === "FIXED") {
    return `${formatPeso(voucher.discountValue)} off`;
  }
  return voucher.maxDiscountAmount != null
    ? `${voucher.discountValue}% off, up to ${formatPeso(voucher.maxDiscountAmount)}`
    : `${voucher.discountValue}% off`;
}

interface VoucherCardProps {
  voucher: RewardVoucher;
  pointsBalance: number;
  onClaim: () => void;
  isClaiming?: boolean;
}

/** A catalog voucher, with a Claim action — disabled with an inline reason
 * when the buyer can't afford it. Mirrors `PaymentMethodPicker`'s
 * selectable-card-with-disabled-reason shape. */
export function VoucherCard({
  voucher,
  pointsBalance,
  onClaim,
  isClaiming,
}: VoucherCardProps) {
  const canAfford = pointsBalance >= voucher.pointCost;

  return (
    <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 flex items-start justify-between gap-4">
      <div className="min-w-0 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--brand-core)]/10 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-[var(--brand-core)]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[var(--text-primary)]">
            {voucher.title}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {discountSummary(voucher)}
          </p>
          {voucher.minOrderAmount != null && (
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Min. order {formatPeso(voucher.minOrderAmount)}
            </p>
          )}
          <p
            className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
              canAfford
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            {voucher.pointCost} pts
            {!canAfford && (
              <span className="text-rose-500 font-normal ml-1">
                Need {voucher.pointCost - pointsBalance} more
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={!canAfford || isClaiming}
        onClick={onClaim}
        className="shrink-0 px-4 py-2 rounded-xl bg-[var(--brand-core)] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isClaiming ? "..." : "Claim"}
      </button>
    </div>
  );
}
