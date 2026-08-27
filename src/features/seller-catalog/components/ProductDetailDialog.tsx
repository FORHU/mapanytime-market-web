"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Package, Trash2, Pencil, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import {
  TAG_LABELS,
  type ProductTagType,
} from "@/shared/constants/product-tags.constant";
import type { UpdateProductInput } from "@/shared/contracts/products.contract";
import { ProductEditForm } from "./ProductEditForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

interface ProductDetailProps {
  product: ProductItem;
  onBack: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onUpdate: (productId: string, input: UpdateProductInput) => Promise<void>;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEditing(false);
    setIsMenuOpen(false);
    setIsConfirmOpen(false);
  }, [product.id]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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
    <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 sm:p-10">
      {/* Header / Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold  bg-[var(--brand-dark)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {!isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              disabled={isDeleting}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div
                role="menu"
                aria-label="Product actions"
                className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border bg-[var(--background-primary)] py-1.5 shadow-xl"
                style={{ borderColor: "var(--border-light)" }}
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit product
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConfirmOpen(true);
                  }}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2.5 border-t border-[var(--border-light)] px-4 py-3 text-left text-sm font-medium text-[#E8567D] transition-colors hover:bg-[#E8567D]/10 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  Archive product
                </button>
              </div>
            )}
          </div>
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
          {/* Left Column: Product Image */}
          <div>
            {product.imageUrl ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed border-[var(--border-light)] bg-[var(--background-secondary)]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border-light)]"
                style={{ background: "var(--background-secondary)" }}
              >
                <Package
                  className="h-20 w-20 mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  No product photo
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col space-y-6 overflow-hidden min-w-0">
            {/* Brand / Manufacturer */}
            {product.brand && (
              <div className="w-full overflow-hidden">
                <p
                  className="text-xs font-bold uppercase tracking-widest break-words overflow-hidden"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {product.brand}
                </p>
              </div>
            )}

            {/* Product Title */}
            <div className="w-full overflow-hidden">
              <h1
                id="product-detail-title"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] break-words overflow-hidden"
              >
                {product.name}
              </h1>
            </div>

            {/* Price and Status Badge */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-4xl font-bold text-[var(--text-primary)]">
                  ₱{formattedPrice}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
                    product.stock === 0
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {product.stock === 0 ? "Out of Stock" : "In Stock"}
                </span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="w-full overflow-hidden">
                <p
                  className="text-base leading-relaxed break-words overflow-hidden"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <p
                  className="mb-3 text-sm font-semibold"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Tags
                </p>

                <div className="flex flex-wrap gap-3">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--md-sys-color-secondary-container)] px-4 py-1.5 text-sm font-medium text-[var(--brand-core)]"
                    >
                      {TAG_LABELS[tag as ProductTagType] ?? tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.options && product.options.length > 0 && (
              <div>
                <p
                  className="mb-3 text-sm font-semibold"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Variants
                </p>

                <div className="space-y-3">
                  {product.options.map((option) => (
                    <div key={option.name}>
                      <p
                        className="mb-1.5 text-xs font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {option.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center rounded-full border border-[var(--border-light)] px-3 py-1.5 text-sm text-[var(--text-secondary)]"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details Card */}
            <div
              className="rounded-2xl border p-6"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Stock
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {product.stock} units
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-4">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Category
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Archive this product?"
        description={`"${product.name}" will be archived and hidden from your storefront. Existing orders keep their record of it.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() => onDelete(product.id!)}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
