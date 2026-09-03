"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Clock } from "lucide-react";
import { useCart, useCartPricing } from "@/features/cart/hooks/useCart";
import {
  usePaymentMethods,
  useCreateOrder,
} from "@/features/checkout/hooks/useCheckout";
import { PriceBreakdown } from "@/features/checkout/components/PriceBreakdown";
import { PaymentMethodPicker } from "@/features/checkout/components/PaymentMethodPicker";
import type { PaymentMethod } from "@/features/checkout/contracts/checkout.contract";

/** Default pickup slot: an hour from now, rounded up to the next 15 minutes. */
function defaultPickupAt(): string {
  const when = new Date(Date.now() + 60 * 60 * 1000);
  when.setMinutes(Math.ceil(when.getMinutes() / 15) * 15, 0, 0);
  // datetime-local wants a local-time string with no timezone suffix.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}T${pad(when.getHours())}:${pad(when.getMinutes())}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [pickupAt, setPickupAt] = useState(defaultPickupAt);

  // One key per mounted checkout. A retried click, or a submit that times out
  // and is tried again, resolves to the same order instead of reserving stock
  // twice.
  const idempotencyKey = useMemo(
    () =>
      globalThis.crypto?.randomUUID?.() ??
      `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const { data: cart } = useCart();
  const {
    data: pricing,
    isLoading: pricingLoading,
    isError: pricingError,
  } = useCartPricing();
  const goodsTotal = pricing?.totalAmount ?? 0;

  const { data: providers, isLoading: methodsLoading } =
    usePaymentMethods(goodsTotal);
  const createOrder = useCreateOrder();

  const isEmpty = !pricingLoading && goodsTotal <= 0;

  const handlePlaceOrder = () => {
    if (!selectedMethod) return;

    createOrder.mutate(
      {
        input: {
          paymentMethodId: selectedMethod.id,
          pickupAt: new Date(pickupAt).toISOString(),
        },
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          // Every method except cash returns a hosted checkout to complete.
          if (order.checkoutUrl) {
            window.location.href = order.checkoutUrl;
            return;
          }
          router.push(`/orders/${order.id}`);
        },
      },
    );
  };

  const errorMessage =
    createOrder.error instanceof Error ? createOrder.error.message : null;

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto p-6 py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)] opacity-40" />
        <h1 className="text-xl font-black text-[var(--text-primary)]">
          Your cart is empty
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Add something from a store to check out.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[var(--brand-core)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Browse stores
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Checkout
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Reserve now, then pay and collect at the stall.
        </p>
      </div>

      {pricingError && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-400">
          Could not price your cart. Please refresh and try again.
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text-tertiary)]">
          Order summary
        </h2>
        {pricingLoading || !pricing ? (
          <div className="h-40 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse" />
        ) : (
          <PriceBreakdown pricing={pricing} selectedMethod={selectedMethod} />
        )}
        {cart?.items?.length ? (
          <p className="text-xs text-[var(--text-tertiary)]">
            {cart.items.length} item{cart.items.length === 1 ? "" : "s"} in this
            order
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text-tertiary)]">
          Pickup time
        </h2>
        <div className="relative">
          <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="datetime-local"
            aria-label="Pickup time"
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text-tertiary)]">
          How would you like to pay?
        </h2>
        <PaymentMethodPicker
          providers={providers ?? []}
          selectedId={selectedMethod?.id ?? null}
          onSelect={setSelectedMethod}
          isLoading={methodsLoading}
        />
      </section>

      {errorMessage && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-400">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={!selectedMethod || createOrder.isPending || pricingLoading}
        className="w-full py-3.5 rounded-2xl bg-[var(--brand-core)] text-white font-black text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {createOrder.isPending
          ? "Placing your order..."
          : selectedMethod
            ? "Place order"
            : "Choose a payment method"}
      </button>
    </div>
  );
}
