import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
});

/** The Redis-backed cart. One store at a time — adding from another replaces it. */
export const CartSchema = z.object({
  storeId: z.string().nullable(),
  items: z.array(CartItemSchema),
});

export const CartItemPricingSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.coerce.number(),
  discountAmount: z.coerce.number(),
  appliedAdId: z.string().nullable().optional(),
  freeUnits: z.number().default(0),
});

/**
 * What the cart costs in goods.
 *
 * `totalAmount` is deliberately NOT the amount that will be charged:
 * `paymentFeeIncluded` is false because the gateway fee is per-method (GCash
 * 2.23%, Maya 1.79%, card 3.125% + ₱13.39) and the buyer has not chosen one
 * yet. The fee is quoted at method selection instead. See FLAGS.md F28.
 */
export const CartPricingSchema = z.object({
  items: z.array(CartItemPricingSchema),
  subtotalAmount: z.coerce.number(),
  discountAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  paymentFeeIncluded: z.boolean().default(false),
});

export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type CartPricing = z.infer<typeof CartPricingSchema>;
export type CartItemPricing = z.infer<typeof CartItemPricingSchema>;
