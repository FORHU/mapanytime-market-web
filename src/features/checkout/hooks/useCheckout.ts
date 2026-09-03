import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  listPaymentMethods,
  createOrder,
  type CreateOrderInput,
} from "../api/checkout.client";
import type { PaymentProvider } from "../contracts/checkout.contract";

/**
 * Payment methods priced for this basket. Re-quotes whenever the goods total
 * changes, because every method's fee is a function of it.
 */
export function usePaymentMethods(amount: number) {
  return useSafeQuery<PaymentProvider[], Error>({
    queryKey: ["payments", "methods", amount],
    queryFn: () => listPaymentMethods(amount),
    enabled: amount > 0,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: CreateOrderInput;
      idempotencyKey: string;
    }) => createOrder(input, idempotencyKey),
    onSuccess: () => {
      // The order consumed the cart; anything holding the old basket is stale.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
