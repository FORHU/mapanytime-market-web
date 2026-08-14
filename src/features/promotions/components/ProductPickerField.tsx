"use client";

import { useProductsPipeline } from "@/shared/hooks/useProductsPipeline";
import { Package } from "lucide-react";

interface ProductPickerFieldProps {
  storeId: string | null;
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
  required?: boolean;
}

export function ProductPickerField({
  storeId,
  selectedProductIds,
  onChange,
  required,
}: ProductPickerFieldProps) {
  const { products, isLoading } = useProductsPipeline(storeId);

  const toggle = (id: string) => {
    onChange(
      selectedProductIds.includes(id)
        ? selectedProductIds.filter((p) => p !== id)
        : [...selectedProductIds, id],
    );
  };

  return (
    <div>
      <label
        className="mb-2 flex items-center gap-1.5 text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        <Package
          className="h-3.5 w-3.5"
          style={{ color: "var(--brand-core)" }}
        />
        Linked products
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      {isLoading && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading products…
        </p>
      )}

      {!isLoading && products.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          You don&apos;t have any products yet — add one first.
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div
          className="max-h-56 space-y-1 overflow-y-auto rounded-xl p-2"
          style={{ border: "1px solid var(--border-default)" }}
        >
          {products.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-[var(--background-tertiary)]"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={p.id ? selectedProductIds.includes(p.id) : false}
                  onChange={() => p.id && toggle(p.id)}
                />
                <span style={{ color: "var(--text-primary)" }}>{p.name}</span>
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.stock} in stock
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
