import { fetcher } from "@/shared/lib/http";
import {
  PaymentProvidersSchema,
  CreatedOrderSchema,
  type PaymentProvider,
  type CreatedOrder,
} from "../contracts/checkout.contract";

/**
 * Payment methods for a basket, each carrying its real fee and the buyer total.
 *
 * `amount` is the goods total, not the final charge — the API prices each
 * method's gateway fee against it and adds it on top, so the totals differ per
 * method. Public endpoint: the picker renders before sign-in on some flows.
 */
export async function listPaymentMethods(
  amount: number,
): Promise<PaymentProvider[]> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/payments/methods?amount=${encodeURIComponent(amount)}`,
  );
  return PaymentProvidersSchema.parse(res.data ?? []);
}

export interface CreateOrderInput {
  paymentMethodId: string;
  /** ISO datetime. Required for PICKUP, which is the only fulfillment type. */
  pickupAt: string;
  productIds?: string[];
}

/**
 * Place the order. Returns a `checkoutUrl` to send the buyer to for every
 * method except cash, which is settled at the stall.
 *
 * The idempotency key stops a double-submit — a retried click, a flaky
 * connection — from creating two orders and reserving stock twice.
 */
export async function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<CreatedOrder> {
  const res = await fetcher<{ data: unknown }>("/api/v1/orders", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ ...input, type: "PICKUP" }),
  });
  return CreatedOrderSchema.parse(res.data);
}
