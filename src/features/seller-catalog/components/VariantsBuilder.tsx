"use client";

import React from "react";
import { Plus, Trash2, X, ChevronDown } from "lucide-react";
import { PRODUCT_LIMITS } from "@/shared/constants/product-limits.constant";
import {
  emptyVariant,
  usedOptionNames,
  type VariantDraft,
} from "../lib/variant-options";

/** Sentinel for the "Others…" entry — no real suggestion can collide with it. */
const OTHER = "__other__";

interface VariantsBuilderProps {
  variants: VariantDraft[];
  setVariants: React.Dispatch<React.SetStateAction<VariantDraft[]>>;
  /** Suggested option names for the product's category, already ancestor-merged. */
  suggestions: string[];
  suggestionsLoading?: boolean;
  disabled?: boolean;
  /** Submit-time message, e.g. an option left with no values. */
  error?: string;
}

/**
 * The option tier builder: "Size: S, M, L".
 *
 * Deliberately NOT a SKU builder — the product keeps one price and one stock
 * number, and no combination here carries inventory of its own.
 */
export function VariantsBuilder({
  variants,
  setVariants,
  suggestions,
  suggestionsLoading = false,
  disabled = false,
  error,
}: VariantsBuilderProps) {
  const atOptionCap = variants.length >= PRODUCT_LIMITS.OPTIONS_MAX;

  const addVariant = () => setVariants([...variants, emptyVariant()]);

  const updateVariant = (id: string, patch: Partial<VariantDraft>) =>
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVariant = (id: string) =>
    setVariants(variants.filter((v) => v.id !== id));

  const addValue = (variant: VariantDraft) => {
    const value = variant.draft.trim();
    if (!value) return;

    // Case-insensitive: the server collapses "red" into "Red", so an exact-match
    // check here would let the form show two chips that save as one.
    const exists = variant.values.some(
      (v) => v.toLowerCase() === value.toLowerCase(),
    );
    if (exists) {
      updateVariant(variant.id, { draft: "" });
      return;
    }

    if (variant.values.length >= PRODUCT_LIMITS.OPTION_VALUES_MAX) return;

    updateVariant(variant.id, {
      values: [...variant.values, value],
      draft: "",
    });
  };

  return (
    <div className="space-y-3">
      {variants.map((variant) => {
        const taken = usedOptionNames(variants, variant.id);
        // Hide names another row already uses — the server would collapse them.
        const available = suggestions.filter(
          (s) => !taken.has(s.toLowerCase()),
        );
        const showSelect = !variant.isCustom && available.length > 0;
        const atValueCap =
          variant.values.length >= PRODUCT_LIMITS.OPTION_VALUES_MAX;

        return (
          <div
            key={variant.id}
            className="rounded-[14px] p-4"
            style={{
              background: "var(--background-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row">
              {/* 1. Left Side: Choose an option type */}
              <div className="relative w-full shrink-0 sm:w-1/2 sm:min-w-[160px]">
                {showSelect ? (
                  <div className="relative w-full">
                    <select
                      value={variant.name || ""}
                      disabled={disabled}
                      onChange={(e) => {
                        if (e.target.value === OTHER) {
                          updateVariant(variant.id, {
                            name: "",
                            isCustom: true,
                          });
                        } else {
                          updateVariant(variant.id, { name: e.target.value });
                        }
                      }}
                      className="h-10 w-full appearance-none rounded-lg px-3 pr-8 text-[13px] font-medium outline-none"
                      style={{
                        color: "var(--text-primary)",
                        background: "var(--background-secondary)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      <option value="">
                        {suggestionsLoading
                          ? "Loading suggestions…"
                          : "Choose an option type"}
                      </option>
                      {available.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value={OTHER}>Others…</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </div>
                ) : (
                  <input
                    value={variant.name}
                    autoFocus={variant.isCustom && !variant.name}
                    disabled={disabled}
                    maxLength={PRODUCT_LIMITS.OPTION_NAME_MAX}
                    onChange={(e) =>
                      updateVariant(variant.id, { name: e.target.value })
                    }
                    placeholder="Option name, e.g. Size or Color"
                    className="h-10 w-full rounded-lg px-3 text-[13px] font-medium outline-none"
                    style={{
                      color: "var(--text-primary)",
                      background: "var(--background-secondary)",
                      border: "1px solid var(--border-default)",
                    }}
                  />
                )}
              </div>

              {/* 2. Middle: Add value container */}
              <div
                className="flex min-h-10 w-full flex-1 flex-wrap items-center gap-1.5 rounded-lg px-3 py-1.5"
                style={{
                  border: "1px solid var(--border-default)",
                  background: "var(--background-elevated)",
                }}
              >
                {variant.values.map((val) => (
                  <span
                    key={val}
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: "var(--background-secondary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(variant.id, {
                          values: variant.values.filter((v) => v !== val),
                        })
                      }
                      disabled={disabled}
                      aria-label={`Remove ${val}`}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {!atValueCap && (
                  <input
                    value={variant.draft}
                    disabled={disabled}
                    maxLength={PRODUCT_LIMITS.OPTION_VALUE_MAX}
                    onChange={(e) =>
                      updateVariant(variant.id, { draft: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addValue(variant);
                      }
                    }}
                    onBlur={() => addValue(variant)}
                    placeholder="Add value, press Enter"
                    className="min-w-[140px] flex-1 bg-transparent text-[13px] outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                )}
              </div>

              {/* 3. Right Side: Trash Button */}
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                disabled={disabled}
                aria-label={`Remove ${variant.name || "option"}`}
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg opacity-70 transition-colors hover:opacity-100"
                style={{
                  background: "var(--background-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <Trash2 className="h-4 w-4 text-[var(--text-secondary)] transition-colors group-hover:text-red-500" />
              </button>
            </div>

            {atValueCap && (
              <p className="mt-2 text-xs" style={{ color: "#b45309" }}>
                Maximum {PRODUCT_LIMITS.OPTION_VALUES_MAX} values reached for
                this option.
              </p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addVariant}
        disabled={disabled || atOptionCap}
        className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed py-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: "var(--border-strong)",
          color: "var(--text-primary)",
        }}
      >
        <Plus className="h-4 w-4" />
        Add option (size, color, material…)
      </button>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
        {atOptionCap
          ? `Maximum ${PRODUCT_LIMITS.OPTIONS_MAX} options reached.`
          : "Optional. Buyers pick from these choices on your listing. Price and stock stay the same for every combination."}
      </p>
    </div>
  );
}
