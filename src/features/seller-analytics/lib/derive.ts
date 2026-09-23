import type {
  BuyerMix,
  PickupPerformance,
  XenditSummary,
} from "../contracts/seller-analytics.contract";

/**
 * Figures the analytics page computes rather than stores.
 *
 * Every rate, total and average on the page goes through here. The alternative,
 * writing "87.6%" next to the counts it is supposed to summarise, lets the two
 * drift apart the moment anyone edits either one, and a report that contradicts
 * itself is worse than one that is merely incomplete.
 */

/** Average order value. Zero orders yields zero, not NaN or Infinity. */
export function averageOrderValue(
  totalRevenue: number,
  totalOrders: number,
): number {
  if (totalOrders <= 0) return 0;
  return totalRevenue / totalOrders;
}

export function pickupTotal(pickup: PickupPerformance): number {
  return pickup.completed + pickup.pending + pickup.cancelled;
}

/**
 * Share of orders that reached the buyer's hands, as a percentage.
 *
 * Pending orders count against the rate: they have not been picked up yet, so
 * treating them as successes would overstate it.
 */
export function pickupCompletionRate(pickup: PickupPerformance): number {
  const total = pickupTotal(pickup);
  if (total <= 0) return 0;
  return (pickup.completed / total) * 100;
}

export function totalBuyers(buyers: BuyerMix): number {
  return buyers.newBuyers + buyers.returningBuyers;
}

/** Share of buyers in the window who had ordered from this store before. */
export function returningBuyerShare(buyers: BuyerMix): number {
  const total = totalBuyers(buyers);
  if (total <= 0) return 0;
  return (buyers.returningBuyers / total) * 100;
}

/** Every payment that went through Xendit, whatever its outcome. */
export function onlinePaymentCount(summary: XenditSummary): number {
  return (
    summary.successfulPayments +
    summary.pendingPayments +
    summary.failedPayments +
    summary.refundedPayments
  );
}

/** "1m 48s" / "48s". Used for the AI listing average. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/** One decimal place, so 87.63 reads as "87.6%" and 90 as "90%". */
export function formatPercentage(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}%`;
}

/** Thousands separators for counts. Figures are read, not computed with. */
export function formatCount(value: number): string {
  return value.toLocaleString("en-PH");
}

/**
 * Coerce a recharts tooltip value to a number.
 *
 * Recharts types a formatter's value as `ValueType | undefined`, where
 * `ValueType` widens to `number | string | Array<number | string>`, so the
 * formatters cannot take a plain `number`. Anything unusable becomes 0 rather
 * than rendering "NaN" into the tooltip.
 */
export function toChartNumber(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}
