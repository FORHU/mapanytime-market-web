import { z } from "zod";

export const PricingComponentSchema = z.object({
  id: z.string(),
  configurationId: z.string().optional(),
  type: z.string(),
  calculationType: z.string().default("PERCENTAGE"),
  ratePercentage: z.number().nullable().optional(),
  rate: z.number().nullable().optional(),
  fixedAmount: z.number().nullable().optional(),
  minFee: z.number().nullable().optional(),
  maxFee: z.number().nullable().optional(),
  methodCode: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  providerId: z.string().nullable().optional(),
  paymentMethodId: z.string().nullable().optional(),
  storeId: z.string().nullable().optional(),
  sellerPlan: z.string().nullable().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  description: z.string().nullable().optional(),
  provider: z
    .object({
      id: z.string(),
      code: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable()
    .optional(),
  paymentMethod: z
    .object({
      id: z.string(),
      code: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const PricingConfigurationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  currency: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  effectiveFrom: z.string().optional(),
  effectiveUntil: z.string().nullable().optional(),
  priority: z.number().optional(),
  paymentFeePayerPolicy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  components: z.array(PricingComponentSchema).optional().default([]),
});

export const PricingConfigurationsResponseSchema = z.array(
  PricingConfigurationSchema,
);

export type PricingConfiguration = z.infer<typeof PricingConfigurationSchema>;
export type PricingComponent = z.infer<typeof PricingComponentSchema>;
