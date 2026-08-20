"use client";

import { Check, Info } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import type {
  PaymentMethod,
  PaymentProvider,
} from "../contracts/checkout.contract";

interface PaymentMethodPickerProps {
  providers: PaymentProvider[];
  selectedId: string | null;
  onSelect: (method: PaymentMethod) => void;
  isLoading?: boolean;
}

/**
 * The buyer picks how to pay, seeing each method's real fee before committing.
 *
 * Unavailable methods stay visible with the reason spelled out — a card gated
 * below a ₱500 basket is a fact the buyer can act on, unlike a greyed-out row.
 */
export function PaymentMethodPicker({
  providers,
  selectedId,
  onSelect,
  isLoading,
}: PaymentMethodPickerProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const methods = providers.flatMap((provider) =>
    provider.methods.map((method) => ({ provider, method })),
  );

  if (methods.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-sm text-[var(--text-secondary)]">
        No payment methods are available right now.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {methods.map(({ provider, method }) => {
        const selected = method.id === selectedId;
        const disabled = !method.available;

        return (
          <button
            key={method.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(method)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              disabled
                ? "border-[var(--border-light)] bg-[var(--background-secondary)]/30 cursor-not-allowed opacity-70"
                : selected
                  ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 shadow-sm"
                  : "border-[var(--border-default)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-core)]/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  {method.name}
                  {selected && (
                    <Check className="w-4 h-4 text-[var(--brand-core)]" />
                  )}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  {provider.name}
                </p>

                {disabled && method.unavailableReason && (
                  <p className="text-[11px] text-amber-500 mt-1.5 flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    {method.unavailableReason}
                  </p>
                )}
              </div>

              {!disabled && typeof method.buyerTotalAmount === "number" && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[var(--text-primary)] tabular-nums">
                    {formatPeso(method.buyerTotalAmount)}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                    {method.feeAmount
                      ? `incl. ${formatPeso(method.feeAmount)} fee`
                      : "no fee"}
                  </p>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
