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

/**
 * Derived server-side from (startAt, expiresAt, isActive) — never sent by the
 * client. `isActive` alone no longer means "live"; it is the seller's pause
 * switch, and this is the field to render.
 */
export const AdWindowStateSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "PAUSED",
  "ENDED",
]);

export const PromotionProductLinkSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
});

export const PromotionBadgeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  description: z.string().nullable().optional(),
  position: z.number(),
  isActive: z.boolean(),
});

export type PromotionBadge = z.infer<typeof PromotionBadgeSchema>;

export const PromotionSchema = z
  .object({
    id: z.string(),
    storeId: z.string(),
    kind: PromotionKindSchema,
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().nullable().optional(),
    badgeId: z.string().nullable().optional(),
    badgeLabel: z.string().nullable().optional(),
    ctaLabel: z.string().nullable().optional(),
    salaryLabel: z.string().nullable().optional(),
    discountType: DiscountTypeSchema.nullable().optional(),
    discountValue: z.union([z.string(), z.number()]).nullable().optional(),
    buyQuantity: z.number().nullable().optional(),
    freeQuantity: z.number().nullable().optional(),
    isActive: z.boolean(),
    startAt: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
    state: AdWindowStateSchema.optional(),
    storeTimezone: z.string().optional(),
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

/**
 * The list endpoint now wraps its rows so it can carry `serverTime`, which the
 * UI uses to measure its own clock drift instead of trusting the browser for
 * countdowns and past-time checks. The bare-array form is still accepted so a
 * web deploy that lands before the API one keeps working.
 */
export const PromotionsResponseSchema = z.union([
  z.object({
    serverTime: z.string(),
    items: z.array(PromotionSchema),
  }),
  z.array(PromotionSchema),
]);

export function unwrapPromotions(response: PromotionsResponse): {
  items: Promotion[];
  serverTime: string | null;
} {
  if (Array.isArray(response)) return { items: response, serverTime: null };
  return { items: response.items, serverTime: response.serverTime };
}

export const PromotionFieldsSchema = z.object({
  kind: PromotionKindSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().optional(),
  badgeId: z.string().nullable().optional(),
  badgeLabel: z.string().nullable().optional(),
  ctaLabel: z.string().optional(),
  salaryLabel: z.string().optional(),
  discountType: DiscountTypeSchema.optional(),
  discountValue: z.number().positive().optional(),
  buyQuantity: z.number().int().min(1).optional(),
  freeQuantity: z.number().int().min(1).optional(),
  startAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
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

export type AdWindowState = z.infer<typeof AdWindowStateSchema>;
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
