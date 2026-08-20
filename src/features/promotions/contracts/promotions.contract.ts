import { z } from "zod";

export const PromotionKindSchema = z.enum(["PROMO", "JOB", "EVENT"]);
export const DiscountTypeSchema = z.enum([
  "BOGO",
  "PERCENTAGE",
  "FIXED_AMOUNT",
]);
export const AdGoalSchema = z.enum([
  "STORE_VISITS",
  "IMPRESSIONS",
  "PURCHASES",
]);
export const AdFormatSchema = z.enum([
  "MAP_FLOATING_CARD",
  "PROMOTED_PIN",
  "DISCOVERY_CAROUSEL",
  "SPONSORED_SEARCH",
]);

export const PromotionProductLinkSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
});

export const PromotionSchema = z
  .object({
    id: z.string(),
    storeId: z.string(),
    kind: PromotionKindSchema,
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().nullable().optional(),
    badgeLabel: z.string().nullable().optional(),
    ctaLabel: z.string().nullable().optional(),
    salaryLabel: z.string().nullable().optional(),
    discountType: DiscountTypeSchema.nullable().optional(),
    discountValue: z.union([z.string(), z.number()]).nullable().optional(),
    buyQuantity: z.number().nullable().optional(),
    freeQuantity: z.number().nullable().optional(),
    isActive: z.boolean(),
    expiresAt: z.string().nullable().optional(),
    goal: AdGoalSchema.nullable().optional(),
    format: AdFormatSchema.nullable().optional(),
    radiusKm: z.number().nullable().optional(),
    targetLat: z.number().nullable().optional(),
    targetLng: z.number().nullable().optional(),
    dailyBudget: z.union([z.string(), z.number()]).nullable().optional(),
    totalBudget: z.union([z.string(), z.number()]).nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    products: z.array(PromotionProductLinkSchema).optional(),
  })
  .loose();

export const PromotionsResponseSchema = z.array(PromotionSchema);

export const PromotionFieldsSchema = z.object({
  kind: PromotionKindSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().optional(),
  badgeLabel: z.string().optional(),
  ctaLabel: z.string().optional(),
  salaryLabel: z.string().optional(),
  discountType: DiscountTypeSchema.optional(),
  discountValue: z.number().positive().optional(),
  buyQuantity: z.number().int().min(1).optional(),
  freeQuantity: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  goal: AdGoalSchema.optional(),
  format: AdFormatSchema.optional(),
  radiusKm: z.number().int().min(1).max(50).optional(),
  targetLat: z.number().optional(),
  targetLng: z.number().optional(),
  dailyBudget: z.number().min(0).optional(),
  totalBudget: z.number().min(0).optional(),
  products: z.array(PromotionProductLinkSchema).optional(),
});

export const CreatePromotionPayloadSchema = PromotionFieldsSchema.extend({
  storeId: z.string(),
});

export type PromotionKind = z.infer<typeof PromotionKindSchema>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type AdGoal = z.infer<typeof AdGoalSchema>;
export type AdFormat = z.infer<typeof AdFormatSchema>;
export type Promotion = z.infer<typeof PromotionSchema>;
export type PromotionsResponse = z.infer<typeof PromotionsResponseSchema>;
export type PromotionFields = z.infer<typeof PromotionFieldsSchema>;
export type CreatePromotionPayload = z.infer<
  typeof CreatePromotionPayloadSchema
>;
