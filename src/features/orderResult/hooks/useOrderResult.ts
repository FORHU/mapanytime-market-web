import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getPaymentStatus } from "../api/orderResult.client";
import type {
  PaymentStatusResponse,
  PaymentStatus,
  ReturnStatus,
} from "../contracts/orderResult.contract";

/** Terminal states — nothing further will change on its own. */
const SETTLED: PaymentStatus[] = [
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

/**
 * Payment state for the order the gateway just sent the buyer back from.
 *
 * Polls every 3s while the payment is unsettled and stops as soon as it is.
 * The redirect and the webhook are two independent hops: the buyer's browser
 * usually wins the race, so a freshly-paid order commonly reads `PENDING` for
 * a few seconds. Polling is what turns that into "confirmed" without the buyer
 * reloading, and stopping on a terminal state is what keeps it from hammering
 * the API forever on a genuinely failed payment.
 */
export function useOrderResult(orderId: string) {
  return useSafeQuery<PaymentStatusResponse, Error>({
    queryKey: ["payments", "status", orderId],
    queryFn: () => getPaymentStatus(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus;
      if (!status) return 3000;
      return SETTLED.includes(status) ? false : 3000;
    },
    // A buyer staring at "waiting for confirmation" should not be shown a
    // stale cached answer if they navigate away and back.
    staleTime: 0,
  });
}

export type Outcome = "paid" | "waiting" | "cancelled" | "failed";

/**
 * Reconciles what the gateway claimed in the URL with what the API knows.
 *
 * The query string is attacker-controlled — anyone can append
 * `?status=success` — so it never decides "paid". It only supplies the tone
 * while the real answer is loading, and disambiguates `PENDING`, which means
 * "no webhook yet" after a success and "buyer walked away" after a cancel.
 */
export function resolveOutcome(
  returned: ReturnStatus,
  payment: PaymentStatus | undefined,
): Outcome {
  if (payment === "COMPLETED") return "paid";
  if (payment === "FAILED") return "failed";
  if (payment === "CANCELLED" || payment === "REFUNDED") return "cancelled";

  // PENDING, PROCESSING, or still loading.
  if (returned === "cancelled") return "cancelled";
  if (returned === "failed") return "failed";
  return "waiting";
}
