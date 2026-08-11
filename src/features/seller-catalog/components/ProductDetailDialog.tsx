"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Tag, Layers, Package, Trash2 } from "lucide-react";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductDetailDialogProps {
  product: ProductItem;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ProductDetailDialog({
  product,
  open,
  onClose,
  onDelete,
  isDeleting,
}: ProductDetailDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const formattedPrice = Number(product.price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h2
              id="product-detail-title"
              className="pr-8 text-xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              {product.name}
            </h2>
            {product.brand && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                by {product.brand}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium"
              style={{
                borderColor: "var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Tag className="h-3.5 w-3.5" />
              {product.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                product.stock === 0
                  ? "border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                  : "border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              {product.stock === 0
                ? "Out of stock"
                : `${product.stock} in stock`}
            </span>
            {product.tags && product.tags.length > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <Layers className="h-3.5 w-3.5" />
                {product.tags.join(", ")}
              </span>
            )}
          </div>

          {product.description && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Description
              </p>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {product.description}
              </p>
            </div>
          )}

          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Price
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  ₱{formattedPrice}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Stock
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    product.stock === 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {product.stock === 0
                    ? "Unavailable"
                    : `${product.stock} units`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--background-secondary)]"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this product? This action cannot be undone.",
                  )
                ) {
                  onDelete(product.id!);
                }
              }}
              disabled={isDeleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting…" : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
