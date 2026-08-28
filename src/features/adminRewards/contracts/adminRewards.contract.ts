import { z } from "zod";

/**
 * The full active `RewardConfigurations` row, from `GET /rewards/admin/config`.
 * Unlike the buyer-facing `RewardConfigSchema`, this exposes every
 * admin-editable field. `null` when no config row has ever been saved — the
 * platform is then running on the API's hardcoded defaults (0.1% earn rate,
 * ₱0.10/point, 12-month expiry).
 */
export const AdminRewardConfigSchema = z.object({
  id: z.string(),
  version: z.coerce.number().int(),
  isActive: z.boolean(),
  earnPercentage: z.coerce.number(),
  pointValueInPhp: z.coerce.number(),
  expirationMonths: z.coerce.number().int(),
  isEarningActive: z.boolean(),
  changeReason: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type AdminRewardConfig = z.infer<typeof AdminRewardConfigSchema>;

export interface UpdateRewardConfigInput {
  earnPercentage?: number;
  pointValueInPhp?: number;
  expirationMonths?: number;
  isEarningActive?: boolean;
  changeReason?: string;
}

export const RewardDiscountTypeSchema = z.enum(["FIXED", "PERCENTAGE"]);
export type RewardDiscountType = z.infer<typeof RewardDiscountTypeSchema>;

/** A voucher in the admin catalog, from `GET /rewards/admin/vouchers`. */
export const AdminVoucherSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  pointCost: z.coerce.number().int(),
  discountType: RewardDiscountTypeSchema,
  discountValue: z.coerce.number(),
  minOrderAmount: z.coerce.number().nullable().optional(),
  maxDiscountAmount: z.coerce.number().nullable().optional(),
  validityDays: z.coerce.number().int(),
  totalStock: z.coerce.number().int().nullable().optional(),
  claimedCount: z.coerce.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type AdminVoucher = z.infer<typeof AdminVoucherSchema>;

export interface CreateVoucherInput {
  title: string;
  description?: string;
  pointCost: number;
  discountType: RewardDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validityDays?: number;
  totalStock?: number;
  isActive?: boolean;
}

export type UpdateVoucherInput = Partial<CreateVoucherInput>;
