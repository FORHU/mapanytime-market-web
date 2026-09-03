import { fetcher } from "@/shared/lib/http";
import {
  CartSchema,
  CartPricingSchema,
  type Cart,
  type CartPricing,
} from "../contracts/cart.contract";

export async function getCart(): Promise<Cart> {
  const res = await fetcher<{ data: unknown }>("/api/v1/cart");
  return CartSchema.parse(res.data ?? { storeId: null, items: [] });
}

/** Setting `quantity` to 0 removes the line. */
export async function setCartItem(input: {
  storeId: string;
  productId: string;
  quantity: number;
}): Promise<Cart> {
  const res = await fetcher<{ data: unknown }>("/api/v1/cart/add", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return CartSchema.parse(res.data);
}

export async function clearCart(): Promise<void> {
  await fetcher<unknown>("/api/v1/cart/clear", { method: "DELETE" });
}

/**
 * What the goods cost. Not the amount that will be charged — see
 * `paymentFeeIncluded` on CartPricingSchema.
 *
 * Answers 400 for an empty cart, which is an ordinary state for this screen
 * rather than an error, so it is normalised to a zeroed preview.
 */
export async function getCartPricing(
  productIds?: string[],
): Promise<CartPricing> {
  try {
    const res = await fetcher<{ data: unknown }>("/api/v1/cart/pricing", {
      method: "POST",
      body: JSON.stringify(productIds?.length ? { productIds } : {}),
    });
    return CartPricingSchema.parse(res.data);
  } catch (error) {
    if ((error as { status?: number })?.status === 400) {
      return {
        items: [],
        subtotalAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        paymentFeeIncluded: false,
      };
    }
    throw error;
  }
}
