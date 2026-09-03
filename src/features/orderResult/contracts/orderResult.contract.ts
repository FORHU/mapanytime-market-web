import { z } from "zod";

/**
 * Payment lifecycle as the API reports it. `PENDING` is the interesting one on
 * this screen: the buyer has come back from the gateway, but the order only
 * becomes paid when the provider's webhook lands, which is a separate network
 * hop that may not have happened yet.
 */
export const PaymentStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
]);

export const OrderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
]);

/** Shape of `GET /v1/payments/orders/:orderId/payment`. */
export const PaymentStatusResponseSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  orderStatus: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  /** Peso amounts arrive as Decimal strings from Prisma. */
  amount: z.coerce.number(),
  currency: z.string(),
  provider: z.string(),
  paymentMethod: z.string(),
  paidAt: z.coerce.date().nullable().optional(),
});

export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/**
 * What the gateway put in the URL when it sent the buyer back.
 *
 * Presentation only — never truth. Anyone can type `?status=success`, so this
 * decides which message is shown *first*, while the authoritative answer comes
 * from the API. See `resolveOutcome`.
 */
export const ReturnStatusSchema = z
  .enum(["success", "cancelled", "failed"])
  .catch("success");

export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;
