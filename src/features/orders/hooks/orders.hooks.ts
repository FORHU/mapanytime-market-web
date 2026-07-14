import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { getOrders, createOrder, getOrderStatus } from "../api/orders.client";
import { ordersKeys } from "../api/orders.keys";
import type { CreateOrderInput } from "../contracts/orders.contract";

/** Fetch all orders for a given store. No-ops until a store is selected. */
export function useOrders(storeId: string) {
  return useSafeQuery({
    queryKey: ordersKeys.lists(storeId),
    queryFn: () => getOrders(storeId),
    enabled: Boolean(storeId),
  });
}

/** Create a new order. Invalidates that store's order list on success. */
export function useCreateOrder(
  storeId: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists(storeId) });
    },
  });
}

/** Poll a single order's status. No-ops until an orderId is known. */
export function useOrderStatus(orderId: string) {
  return useSafeQuery({
    queryKey: ordersKeys.status(orderId),
    queryFn: () => getOrderStatus(orderId),
    enabled: Boolean(orderId),
  });
}
