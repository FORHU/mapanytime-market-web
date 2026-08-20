"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Check, Loader2 } from "lucide-react";
import { useCart, useCartActions } from "../hooks/useCart";

interface AddToCartButtonProps {
  storeId: string;
  productId: string;
  productName: string;
}

/**
 * Add a product to the cart, then step its quantity.
 *
 * The cart holds one store at a time; adding from a different store replaces
 * it, so the switch is confirmed rather than silently discarding a basket the
 * buyer was still building.
 */
export function AddToCartButton({
  storeId,
  productId,
  productName,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { data: cart } = useCart();
  const { setItem } = useCartActions();
  const [error, setError] = useState<string | null>(null);

  const quantity =
    cart?.items?.find((item) => item.productId === productId)?.quantity ?? 0;

  const changeQuantity = (next: number) => {
    setError(null);

    const switchingStore =
      Boolean(cart?.storeId) && cart?.storeId !== storeId && next > 0;

    if (
      switchingStore &&
      !window.confirm(
        "Your cart has items from another store. Adding this will start a new cart. Continue?",
      )
    ) {
      return;
    }

    setItem.mutate(
      { storeId, productId, quantity: next },
      {
        onError: (err) =>
          setError(
            err instanceof Error ? err.message : "Could not update your cart.",
          ),
      },
    );
  };

  if (quantity > 0) {
    return (
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/5 p-1">
          <button
            type="button"
            aria-label={`Remove one ${productName}`}
            onClick={(e) => {
              e.stopPropagation();
              changeQuantity(quantity - 1);
            }}
            disabled={setItem.isPending}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="text-sm font-bold text-on-surface tabular-nums">
            {setItem.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              quantity
            )}
          </span>

          <button
            type="button"
            aria-label={`Add one more ${productName}`}
            onClick={(e) => {
              e.stopPropagation();
              changeQuantity(quantity + 1);
            }}
            disabled={setItem.isPending}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push("/checkout");
          }}
          className="w-full py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity"
        >
          Go to checkout
        </button>

        {error && <p className="text-[10px] text-rose-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          changeQuantity(1);
        }}
        disabled={setItem.isPending}
        className="w-full py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-bold hover:bg-primary/5 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
      >
        {setItem.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : setItem.isSuccess ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        Add to cart
      </button>
      {error && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
