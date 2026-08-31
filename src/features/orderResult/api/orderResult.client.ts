import { fetcher } from "@/shared/lib/http";
import {
  PaymentStatusResponseSchema,
  type PaymentStatusResponse,
} from "../contracts/orderResult.contract";

/**
 * Authoritative payment state for one order.
 *
 * Note the `/payments` prefix: the route is registered on the payments router,
 * not the orders one, so the bare `/orders/:id/payment` path 404s.
 *
 * Access is enforced server-side — `assertOrderAccess` 403s an order that does
 * not belong to the caller — so a guessed order id in the URL reveals nothing.
 */
export async function getPaymentStatus(
  orderId: string,
): Promise<PaymentStatusResponse> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/payments/orders/${encodeURIComponent(orderId)}/payment`,
  );
  return PaymentStatusResponseSchema.parse(res.data);
}
