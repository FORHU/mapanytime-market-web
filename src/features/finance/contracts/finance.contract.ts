import { z } from "zod";

/** Prisma `Decimal` columns arrive as JSON strings — coerce, never assert. */
const MoneySchema = z.coerce.number();

export const SettlementStatusSchema = z.enum([
  "PENDING",
  "HELD",
  "RELEASED",
  "REFUNDED",
]);

export const SettlementSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  sellerId: z.string(),
  subtotalAmount: MoneySchema,
  commissionAmount: MoneySchema,
  paymentFeeAmount: MoneySchema,
  sellerNetAmount: MoneySchema,
  status: SettlementStatusSchema,
  releaseEligibleAt: z.string(),
  settledAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SettlementsSchema = z.array(SettlementSchema);

export const PayoutStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const PayoutSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  payoutNumber: z.string(),
  totalAmount: MoneySchema,
  status: PayoutStatusSchema,
  payoutMethod: z.string(),
  referenceNo: z.string().nullable().optional(),
  processedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const PayoutsSchema = z.array(PayoutSchema);

/**
 * Only `RELEASED` settlements not already attached to a payout are eligible;
 * the backend rejects the request outright when none of the ids qualify.
 */
export const CreatePayoutInputSchema = z.object({
  sellerId: z.string().min(1),
  payoutMethod: z.string().min(1),
  settlementIds: z.array(z.string()).min(1),
  referenceNo: z.string().optional(),
});

export const UpdatePayoutStatusInputSchema = z.object({
  payoutId: z.string().min(1),
  status: PayoutStatusSchema,
  referenceNo: z.string().optional(),
});

export type SettlementStatus = z.infer<typeof SettlementStatusSchema>;
export type Settlement = z.infer<typeof SettlementSchema>;
export type PayoutStatus = z.infer<typeof PayoutStatusSchema>;
export type Payout = z.infer<typeof PayoutSchema>;
export type CreatePayoutInput = z.infer<typeof CreatePayoutInputSchema>;
export type UpdatePayoutStatusInput = z.infer<
  typeof UpdatePayoutStatusInputSchema
>;
