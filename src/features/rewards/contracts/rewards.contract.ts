import { z } from "zod";

/** `GET /rewards/wallet`. */
export const RewardWalletSchema = z.object({
  balance: z.coerce.number().int(),
  estimatedValuePhp: z.coerce.number(),
  lifetimeEarned: z.coerce.number().int(),
  lifetimeSpent: z.coerce.number().int(),
});
export type RewardWallet = z.infer<typeof RewardWalletSchema>;

/**
 * Display-safe subset of the active earn-rate config, from
 * `GET /rewards/config`. Used only for a client-side "you'll earn ~N points"
 * estimate — the authoritative award happens server-side on order completion.
 */
export const RewardConfigSchema = z.object({
  earnPercentage: z.coerce.number(),
  pointValueInPhp: z.coerce.number(),
  isEarningActive: z.boolean(),
});
export type RewardConfig = z.infer<typeof RewardConfigSchema>;

export const RewardDiscountTypeSchema = z.enum(["FIXED", "PERCENTAGE"]);

/** A voucher in the claimable catalog. `GET /rewards/vouchers`. */
export const RewardVoucherSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  pointCost: z.coerce.number().int(),
  discountType: RewardDiscountTypeSchema,
  discountValue: z.coerce.number(),
  minOrderAmount: z.coerce.number().nullable().optional(),
  maxDiscountAmount: z.coerce.number().nullable().optional(),
  validityDays: z.coerce.number().int().default(30),
});
export type RewardVoucher = z.infer<typeof RewardVoucherSchema>;

export const UserVoucherStatusSchema = z.enum(["ACTIVE", "USED", "EXPIRED"]);

/**
 * A voucher the buyer has claimed. `GET /rewards/my-vouchers`,
 * `POST /rewards/vouchers/:id/claim`.
 */
export const UserVoucherSchema = z.object({
  id: z.string(),
  voucher: RewardVoucherSchema,
  status: UserVoucherStatusSchema,
  pointsSpent: z.coerce.number().int(),
  claimedAt: z.string(),
  expiresAt: z.string(),
  usedAt: z.string().nullable().optional(),
});
export type UserVoucher = z.infer<typeof UserVoucherSchema>;

/** One row of the MapPoints ledger. */
export const RewardTransactionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "EARN",
    "SPEND",
    "BONUS",
    "REFUND",
    "EXPIRED",
    "REVERSAL",
    "ADJUSTMENT",
  ]),
  amount: z.coerce.number().int(),
  balanceAfter: z.coerce.number().int(),
  createdAt: z.string(),
  description: z.string().nullable().optional(),
});
export type RewardTransaction = z.infer<typeof RewardTransactionSchema>;

/**
 * The ledger's page envelope. Doesn't match `PaginatedResponse<T>`
 * (`{ data, meta: { pageSize } }`) — the backend's `buildPage()` helper
 * returns `{ items, total, page, limit, totalPages }` for every paginated
 * endpoint in this API, so this mirrors that shape instead of forcing a fit.
 */
export const RewardTransactionPageSchema = z.object({
  items: z.array(RewardTransactionSchema),
  total: z.coerce.number().int(),
  page: z.coerce.number().int(),
  limit: z.coerce.number().int(),
  totalPages: z.coerce.number().int(),
});
export type RewardTransactionPage = z.infer<typeof RewardTransactionPageSchema>;

/**
 * Estimated discount a voucher is worth against [eligibleSubtotal] — the
 * same formula the backend applies in `RewardService.validateVoucherForOrder`.
 * The order response is the source of truth; this is a checkout-time preview.
 */
export function estimateVoucherDiscount(
  voucher: RewardVoucher,
  eligibleSubtotal: number,
): number {
  let amount =
    voucher.discountType === "FIXED"
      ? voucher.discountValue
      : eligibleSubtotal * (voucher.discountValue / 100);
  if (voucher.maxDiscountAmount != null && amount > voucher.maxDiscountAmount) {
    amount = voucher.maxDiscountAmount;
  }
  if (amount > eligibleSubtotal) amount = eligibleSubtotal;
  return amount < 0 ? 0 : amount;
}

export function voucherMeetsMinimum(
  voucher: RewardVoucher,
  eligibleSubtotal: number,
): boolean {
  return (
    voucher.minOrderAmount == null || eligibleSubtotal >= voucher.minOrderAmount
  );
}

/** Estimated points earned on [eligibleSubtotal]. Rounds to the nearest
 * point, matching the backend's award calculation. */
export function estimatePointsEarned(
  config: RewardConfig,
  eligibleSubtotal: number,
): number {
  if (!config.isEarningActive || config.pointValueInPhp <= 0) return 0;
  return Math.round(
    (eligibleSubtotal * config.earnPercentage) / config.pointValueInPhp,
  );
}
