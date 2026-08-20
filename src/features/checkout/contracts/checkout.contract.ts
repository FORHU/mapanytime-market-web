import { z } from "zod";

/**
 * One payment method as the picker needs it, from
 * `GET /v1/payments/methods?amount=`.
 *
 * The fee is quoted per method because each one bills a different rate, and it
 * is grossed up so the platform nets its commission whatever the buyer picks.
 * `unavailableReason` explains a disabled method rather than just greying it
 * out — cards, for instance, are gated below a ₱500 basket.
 */
export const PaymentMethodSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: z.string(),
  available: z.boolean(),
  unavailableReason: z.string().optional(),
  feeAmount: z.coerce.number().optional(),
  buyerTotalAmount: z.coerce.number().optional(),
});

export const PaymentProviderSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  methods: z.array(PaymentMethodSchema),
});

export const PaymentProvidersSchema = z.array(PaymentProviderSchema);

export const CreatedOrderSchema = z.object({
  id: z.string(),
  totalAmount: z.coerce.number(),
  status: z.string(),
  checkoutUrl: z.string().nullable().optional(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type CreatedOrder = z.infer<typeof CreatedOrderSchema>;
