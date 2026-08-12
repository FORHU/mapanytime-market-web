"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HomeIcon, KeyRoundIcon, StoreIcon, XIcon } from "lucide-react";
import type { StoreType } from "../types";

interface StoreTypeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: StoreType) => void;
}

const STORE_TYPE_OPTIONS: Array<{
  type: StoreType;
  label: string;
  description: string;
  icon: typeof StoreIcon;
  disabled?: boolean;
}> = [
  {
    type: "store",
    label: "Store",
    description: "Standard retail / e-commerce",
    icon: StoreIcon,
  },
  {
    type: "house-lot",
    label: "House or Lot",
    description: "Real estate / property selling",
    icon: HomeIcon,
  },
  {
    type: "renting",
    label: "Renting",
    disabled: true,
    description: "Coming Soon",
    icon: KeyRoundIcon,
  },
];

export function StoreTypeSelectionModal({
  open,
  onClose,
  onSelect,
}: StoreTypeSelectionModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-type-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close store type selection"
          className="absolute right-4 top-4 rounded-xl p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]"
        >
          <XIcon className="h-5 w-5" />
        </button>

        <div className="pr-10 text-left">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-core)]">
            New business setup
          </p>
          <h2
            id="store-type-modal-title"
            className="text-xl font-black tracking-tight text-[var(--text-primary)] md:text-2xl"
          >
            What type of business are you setting up?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Choose the setup that best matches what you want to sell, lease, or
            manage.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STORE_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;

            const isDisabled = option.disabled === true;

            return (
              <button
                key={option.type}
                type="button"
                disabled={isDisabled}
                aria-disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onSelect(option.type);
                }}
                className={`group flex min-h-48 flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all duration-300 focus:outline-none ${
                  isDisabled
                    ? "cursor-not-allowed border-[var(--border-light)] bg-[var(--background-tertiary)] opacity-50"
                    : "border-[var(--border-light)] bg-[var(--background-elevated)] hover:-translate-y-1 hover:border-[var(--brand-core)] hover:bg-[var(--background-tertiary)] hover:shadow-xl focus:ring-2 focus:ring-[var(--brand-core)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)]"
                }`}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-core)]/10 text-[var(--brand-core)] transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-sm font-black text-[var(--text-primary)]">
                  {option.label}
                </span>
                <span className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-6 block text-xs font-bold text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
}
