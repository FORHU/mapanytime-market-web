import { z } from "zod";

/** Prisma `Decimal` columns arrive as JSON strings — coerce, never assert. */
const MoneySchema = z.coerce.number();

export const PayerPolicySchema = z.enum([
  "BUYER",
  "SELLER",
  "PLATFORM",
  "SHARED",
]);
export type PayerPolicy = z.infer<typeof PayerPolicySchema>;

export const PricingComponentTypeSchema = z.enum([
  "BUYER_TRANSACTION_FEE",
  "SELLER_MARKETPLACE_FEE",
  "PAYMENT_PROCESSING_FEE",
  "FIXED_TRANSACTION_FEE",
  "WITHDRAWAL_FEE",
  "ADVERTISING_FEE",
]);

export const PricingComponentSchema = z.object({
  id: z.string(),
  type: PricingComponentTypeSchema,
  calculationType: z
    .enum(["PERCENTAGE", "FIXED", "PERCENTAGE_AND_FIXED"])
    .optional(),
  ratePercentage: MoneySchema.nullable().optional(),
  fixedAmount: MoneySchema.nullable().optional(),
  minFee: MoneySchema.nullable().optional(),
  maxFee: MoneySchema.nullable().optional(),
  sellerPlan: z.string().nullable().optional(),
  storeId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  isActive: z.boolean(),
  provider: z
    .object({ id: z.string(), code: z.string(), name: z.string() })
    .nullable()
    .optional(),
  paymentMethod: z
    .object({ id: z.string(), code: z.string(), name: z.string() })
    .nullable()
    .optional(),
});
export type PricingComponent = z.infer<typeof PricingComponentSchema>;

/**
 * GET /pricing/active answers with a stored configuration when one exists and
 * with the engine's hardcoded fallback rates when none does — the two shapes
 * share only name/status/currency, so the union keeps both readable.
 */
export const ActivePricingSchema = z.union([
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    status: z.string(),
    currency: z.string(),
    effectiveFrom: z.string(),
    effectiveUntil: z.string().nullable().optional(),
    components: z.array(PricingComponentSchema).default([]),
  }),
  z.object({
    name: z.string(),
    status: z.string(),
    currency: z.string(),
    defaultSellerCommission: MoneySchema,
    defaultBuyerPlatformFee: MoneySchema,
    defaultGatewayProcessingFee: MoneySchema,
  }),
]);
export type ActivePricing = z.infer<typeof ActivePricingSchema>;

/** True when the API fell back to engine defaults rather than a stored config. */
export function isFallbackPricing(
  pricing: ActivePricing,
): pricing is Extract<ActivePricing, { defaultSellerCommission: number }> {
  return "defaultSellerCommission" in pricing;
}

export const PricingCalculationSchema = z.object({
  subtotalAmount: MoneySchema,
  discountAmount: MoneySchema,
  shippingAmount: MoneySchema,
  taxAmount: MoneySchema,
  orderAmount: MoneySchema,
  paymentProcessingCost: z.object({
    componentName: z.string().optional(),
    ratePercentage: MoneySchema,
    fixedAmount: MoneySchema,
    calculatedCost: MoneySchema,
  }),
  buyerPlatformFee: z.object({
    componentName: z.string().optional(),
    ratePercentage: MoneySchema,
    fixedAmount: MoneySchema,
    amount: MoneySchema,
  }),
  buyerTransactionFee: z.object({
    payerPolicy: PayerPolicySchema,
    providerProcessingFee: MoneySchema,
    platformHandlingFee: MoneySchema,
    totalBuyerFeeAmount: MoneySchema,
    effectiveRatePercentage: MoneySchema,
  }),
  buyerTotalAmount: MoneySchema,
  sellerMarketplaceCommission: z.object({
    label: z.string(),
    rate: MoneySchema,
    amount: MoneySchema,
  }),
  sellerNetAmount: MoneySchema,
  platformGrossRevenue: MoneySchema,
  platformPaymentCost: MoneySchema,
  platformNetRevenue: MoneySchema,
});
export type PricingCalculation = z.infer<typeof PricingCalculationSchema>;

export interface CalculatePricingInput {
  subtotalAmount: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  paymentMethodCode?: string;
  paymentFeePayerPolicy?: PayerPolicy;
}
