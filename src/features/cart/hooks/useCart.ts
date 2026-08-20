import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  getCart,
  setCartItem,
  clearCart,
  getCartPricing,
} from "../api/cart.client";
import type { Cart, CartPricing } from "../contracts/cart.contract";

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  pricing: () => [...cartKeys.all, "pricing"] as const,
};

export function useCart() {
  return useSafeQuery<Cart, Error>({
    queryKey: cartKeys.detail(),
    queryFn: getCart,
  });
}

/**
 * Goods pricing for the current cart. Kept separate from the cart itself so a
 * quantity change refetches the money without re-reading the basket.
 */
export function useCartPricing(enabled = true) {
  return useSafeQuery<CartPricing, Error>({
    queryKey: cartKeys.pricing(),
    queryFn: () => getCartPricing(),
    enabled,
  });
}

export function useCartActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: cartKeys.all });

  const setItem = useSafeMutation({
    mutationFn: (input: {
      storeId: string;
      productId: string;
      quantity: number;
    }) => setCartItem(input),
    onSuccess: invalidate,
  });

  const clear = useSafeMutation({
    mutationFn: () => clearCart(),
    onSuccess: invalidate,
  });

  return { setItem, clear };
}
