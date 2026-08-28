"use client";

import { Check } from "lucide-react";
import type { UserVoucher } from "../contracts/rewards.contract";
import { discountSummary } from "./VoucherCard";

const statusStyle: Record<
  UserVoucher["status"],
  { label: string; className: string }
> = {
  ACTIVE: { label: "Active", className: "text-emerald-500 bg-emerald-500/10" },
  USED: {
    label: "Used",
    className: "text-[var(--text-tertiary)] bg-[var(--text-tertiary)]/10",
  },
  EXPIRED: { label: "Expired", className: "text-rose-500 bg-rose-500/10" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface MyVoucherCardProps {
  userVoucher: UserVoucher;
  /** Only meaningful for an active, unexpired voucher — e.g. the checkout
   * picker. Omit to render as read-only history. */
  onApply?: () => void;
  selected?: boolean;
}

export function MyVoucherCard({
  userVoucher,
  onApply,
  selected,
}: MyVoucherCardProps) {
  const style = statusStyle[userVoucher.status];
  const dateLine =
    userVoucher.status === "ACTIVE"
      ? `Expires ${formatDate(userVoucher.expiresAt)}`
      : userVoucher.status === "USED" && userVoucher.usedAt
        ? `Used ${formatDate(userVoucher.usedAt)}`
        : `Expired ${formatDate(userVoucher.expiresAt)}`;

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-[var(--text-primary)]">
            {userVoucher.voucher.title}
          </p>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.className}`}
          >
            {style.label}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {discountSummary(userVoucher.voucher)}
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
          {dateLine}
        </p>
      </div>
      {onApply && (
        <Check
          className={`w-5 h-5 shrink-0 ${
            selected
              ? "text-[var(--brand-core)]"
              : "text-[var(--text-tertiary)] opacity-0"
          }`}
        />
      )}
    </div>
  );

  const className = `w-full text-left p-4 rounded-2xl border transition-all ${
    selected
      ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5"
      : "border-[var(--border-default)] bg-[var(--background-secondary)]/50"
  }`;

  if (!onApply) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onApply} className={className}>
      {content}
    </button>
  );
}
