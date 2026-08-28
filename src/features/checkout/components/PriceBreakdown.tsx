import { Tag, Coins, PlusCircle } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import type {
  CheckoutPricingSummary,
  PaymentMethod,
} from "../contracts/checkout.contract";

interface PriceBreakdownProps {
  pricing: CheckoutPricingSummary;
  /** Once a method is chosen, its fee and the real total are shown. */
  selectedMethod?: PaymentMethod | null;
  /**
   * A claimed MapPoints voucher's estimated discount, if one is applied.
   * Kept separate from `pricing.discountAmount` — that's a seller-funded
   * merchant/ad discount, this is a platform-funded MapPoints redemption,
   * and the two must not be conflated (OPEN-FLAGS.md F39/F40). An estimate
   * only; the order response is the source of truth.
   */
  voucherDiscountAmount?: number;
  /**
   * Estimated MapPoints the buyer will earn if this order completes. Points
   * are only actually credited on COMPLETED, not at checkout — shown as an
   * estimate for that reason.
   */
  pointsToEarn?: number;
}

function Row({
  label,
  value,
  hint,
  bold,
  positive,
}: {
  label: string;
  value: string;
  hint?: string;
  bold?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          className={`${bold ? "font-black text-[var(--text-primary)]" : "text-[var(--text-secondary)]"} text-sm`}
        >
          {label}
        </p>
        {hint && (
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            {hint}
          </p>
        )}
      </div>
      <p
        className={`text-sm shrink-0 tabular-nums ${
          bold
            ? "font-black text-[var(--text-primary)] text-base"
            : positive
              ? "font-bold text-emerald-500"
              : "font-bold text-[var(--text-primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Server-verified breakdown, mirroring the Flutter app's
 * `price_breakdown_card.dart` so both clients show the same figures.
 *
 * Until a payment method is picked the goods total is shown and labelled as
 * such — the gateway fee is per-method (GCash 2.23%, Maya 1.79%, card 3.125% +
 * ₱13.39), so a single "Total" here would change at the payment step. Once a
 * method is chosen its fee and the real charge replace it. See FLAGS.md F19.
 */
export function PriceBreakdown({
  pricing,
  selectedMethod,
  voucherDiscountAmount,
  pointsToEarn,
}: PriceBreakdownProps) {
  const hasDiscount = pricing.discountAmount > 0;
  const hasVoucher = (voucherDiscountAmount ?? 0) > 0;
  const fee = selectedMethod?.feeAmount;
  const buyerTotal = selectedMethod?.buyerTotalAmount;
  const showsFee = typeof fee === "number" && typeof buyerTotal === "number";

  // ponytail: `GET /payments/methods` quotes `fee`/`buyerTotal` against the
  // pre-voucher goods total (this component has no way to re-quote it), so
  // only the two totals below are adjusted by subtracting the voucher — the
  // fee itself is a small approximation until the order is actually created.
  // The order response is the source of truth; upgrade path is threading
  // voucherAmount into the payment-methods quote if this drifts enough to
  // matter.
  const lessVoucher = (amount: number) => {
    const result = amount - (voucherDiscountAmount ?? 0);
    return result < 0 ? 0 : result;
  };

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Vouchers &amp; Discounts
        </p>
        <p
          className={`text-sm shrink-0 tabular-nums font-bold ${
            hasDiscount ? "text-emerald-500" : "text-[var(--text-tertiary)]"
          }`}
        >
          {hasDiscount
            ? `-${formatPeso(pricing.discountAmount)}`
            : "None applied"}
        </p>
      </div>

      {hasVoucher && (
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            MapPoints voucher
          </p>
          <p className="text-sm shrink-0 tabular-nums font-bold text-emerald-500">
            -{formatPeso(voucherDiscountAmount!)}
          </p>
        </div>
      )}

      <Row label="Subtotal" value={formatPeso(pricing.subtotalAmount)} />

      {(pointsToEarn ?? 0) > 0 && (
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            You&apos;ll earn
          </p>
          <p className="text-sm shrink-0 tabular-nums font-bold text-[var(--text-primary)]">
            ~{pointsToEarn} pts
          </p>
        </div>
      )}

      <div className="h-px bg-[var(--border-light)]" />

      {showsFee ? (
        <>
          <Row
            label="Order total"
            value={formatPeso(lessVoucher(pricing.totalAmount))}
            hint="Cost of the goods"
          />
          <Row
            label={`${selectedMethod?.name} fee`}
            value={formatPeso(fee)}
            hint="Charged by the payment provider"
          />
          <div className="h-px bg-[var(--border-light)]" />
          <Row
            label="Total to pay"
            value={formatPeso(lessVoucher(buyerTotal))}
            bold
          />
        </>
      ) : (
        <Row
          label="Order total"
          value={formatPeso(lessVoucher(pricing.totalAmount))}
          hint="Payment fee added when you choose how to pay"
          bold
        />
      )}
    </div>
  );
}
