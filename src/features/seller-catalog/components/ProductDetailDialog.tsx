"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Tag, Layers, Package, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import type { UpdateProductInput } from "@/shared/contracts/products.contract";
import { ProductEditForm } from "./ProductEditForm";

interface ProductDetailProps {
  product: ProductItem;
  onBack: () => void; // Renamed from onClose to onBack for page flow
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onUpdate: (
    productId: string,
    input: UpdateProductInput,
  ) => Promise<ProductItem>;
  isUpdating: boolean;
}

export function ProductDetail({
  product,
  onBack,
  onDelete,
  isDeleting,
  onUpdate,
  isUpdating,
}: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Reset editing state if the product changes
  useEffect(() => {
    setIsEditing(false);
  }, [product.id]);

  const handleUpdate = async (input: UpdateProductInput) => {
    try {
      await onUpdate(product.id!, input);
      setIsEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update product. Try again.",
      );
    }
  };

  const formattedPrice = Number(product.price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-sm sm:p-10">
      {/* Header / Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-light)] pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors bg-[var(--background-secondary)] hover:bg-[var(--border-light)] text-[var(--text-primary)] border border-[var(--border-light)]"
            aria-label="Edit product"
          >
            <Pencil className="h-4 w-4 text-emerald-500" />
            Edit Product
          </button>
        )}
      </div>

      <div className="space-y-8">
        <div>
          <h2
            id="product-detail-title"
            className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          >
            {product.name}
          </h2>
          {product.brand && (
            <p
              className="mt-2 text-lg font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Brand: {product.brand}
            </p>
          )}
        </div>

        {isEditing ? (
          <div className="mx-auto max-w-2xl rounded-2xl bg-[var(--background-secondary)] p-6 border border-[var(--border-light)]">
            <ProductEditForm
              product={product}
              isSaving={isUpdating}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleUpdate}
            />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
            {/* Left Column: Image */}
            <div className="space-y-4">
              {product.imageUrl ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[var(--border-light)] bg-[var(--background-secondary)]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-6"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-square w-full items-center justify-center rounded-3xl border border-[var(--border-light)]"
                  style={{ background: "var(--background-secondary)" }}
                >
                  <Package
                    className="h-20 w-20"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col space-y-8">
              <div className="flex flex-wrap gap-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium"
                  style={{
                    borderColor: "var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Tag className="h-4 w-4" />
                  {product.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    product.stock === 0
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  {product.stock === 0
                    ? "Out of stock"
                    : `${product.stock} in stock`}
                </span>
                {product.tags && product.tags.length > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium"
                    style={{
                      borderColor: "var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Layers className="h-4 w-4" />
                    {product.tags.join(", ")}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="rounded-2xl bg-[var(--background-secondary)] p-6">
                  <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Description
                  </h3>
                  <p
                    className="mt-3 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              <div
                className="mt-auto rounded-2xl border p-6 shadow-sm"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Price
                    </h3>
                    <p className="mt-2 text-4xl font-bold text-[var(--text-primary)]">
                      ₱{formattedPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Stock
                    </h3>
                    <p
                      className={`mt-2 text-2xl font-semibold ${
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

              <div className="pt-4">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-semibold text-rose-500 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-40 border border-rose-200 dark:border-rose-900"
                >
                  <Trash2 className="h-5 w-5" />
                  {isDeleting ? "Deleting…" : "Delete Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
