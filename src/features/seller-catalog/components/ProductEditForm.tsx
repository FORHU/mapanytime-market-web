"use client";

import React, { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import type { UpdateProductInput } from "@/shared/contracts/products.contract";

interface ProductEditFormProps {
  product: ProductItem;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateProductInput) => Promise<void>;
}

const inputClassName =
  "w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]";

export function ProductEditForm({
  product,
  isSaving,
  onCancel,
  onSubmit,
}: ProductEditFormProps) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price || ""));
  const [stock, setStock] = useState(String(product.stock));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = "Product name is required";
    }

    if (description.length > 600) {
      nextErrors.description = "Description must be 600 characters or fewer";
    }

    const priceValue = Number(price);
    if (price === "" || !Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = "Price must be a positive number";
    }

    const stockValue = Number(stock);
    if (stock === "" || !Number.isInteger(stockValue) || stockValue < 0) {
      nextErrors.stock = "Stock must be a non-negative whole number";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      name: name.trim(),
      description,
      price: priceValue,
      stock: stockValue,
    });
  };

  const fieldErrorProps = (field: string) => {
    const hasError = Boolean(errors[field]);
    return {
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${field}-error` : undefined,
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="edit-product-name"
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          Product name <span className="text-rose-500">*</span>
        </label>
        <input
          id="edit-product-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
          className={inputClassName}
          {...fieldErrorProps("name")}
        />
        {errors.name && (
          <p
            id="name-error"
            role="alert"
            className="mt-1 text-xs text-rose-500"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-product-description"
          className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-[var(--text-primary)]"
        >
          <span>Description</span>
          <span className="text-xs text-[var(--text-secondary)]">
            {description.length}/600
          </span>
        </label>
        <textarea
          id="edit-product-description"
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value.slice(0, 600));
            clearError("description");
          }}
          className={`${inputClassName} resize-none`}
          {...fieldErrorProps("description")}
        />
        {errors.description && (
          <p
            id="description-error"
            role="alert"
            className="mt-1 text-xs text-rose-500"
          >
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-product-price"
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          Price <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)]">
            ₱
          </span>
          <input
            id="edit-product-price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              clearError("price");
            }}
            className={`${inputClassName} pl-7`}
            {...fieldErrorProps("price")}
          />
        </div>
        {errors.price && (
          <p
            id="price-error"
            role="alert"
            className="mt-1 text-xs text-rose-500"
          >
            {errors.price}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-product-stock"
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          Stock <span className="text-rose-500">*</span>
        </label>
        <input
          id="edit-product-stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={stock}
          onChange={(e) => {
            setStock(e.target.value);
            clearError("stock");
          }}
          className={inputClassName}
          {...fieldErrorProps("stock")}
        />
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Current stock: {product.stock}
        </p>
        {errors.stock && (
          <p
            id="stock-error"
            role="alert"
            className="mt-1 text-xs text-rose-500"
          >
            {errors.stock}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--background-secondary)] disabled:opacity-40"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </span>
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{
            background: "var(--brand-core)",
            color: "var(--background-primary)",
          }}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
