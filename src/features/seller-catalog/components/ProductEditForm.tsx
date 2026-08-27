"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import type { UpdateProductInput } from "@/shared/contracts/products.contract";
import {
  ALL_PRODUCT_TAGS,
  type ProductTagType,
} from "@/shared/constants/product-tags.constant";
import {
  PRODUCT_LIMITS,
  PRICE_MAX_LABEL,
  STOCK_MAX_LABEL,
} from "@/shared/constants/product-limits.constant";
import TagSelector from "./TagSelector";
import { VariantsBuilder } from "./VariantsBuilder";
import { useCategoryVariantSuggestions } from "../hooks/useCategoryVariantSuggestions";
import {
  toVariantDrafts,
  toOptionsPayload,
  canonicalOptions,
  type VariantDraft,
} from "../lib/variant-options";

interface ProductEditFormProps {
  product: ProductItem;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateProductInput) => Promise<void>;
}

const inputClassName =
  "w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--brand-core)] focus:ring-2 focus:ring-[var(--brand-core)]/20";

const errorInputClassName =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function ProductEditForm({
  product,
  isSaving,
  onCancel,
  onSubmit,
}: ProductEditFormProps) {
  // Form state - ensure all values are strings
  const [name, setName] = useState(String(product.name || ""));
  const [brand, setBrand] = useState(String(product.brand || ""));
  const [description, setDescription] = useState(
    String(product.description || ""),
  );
  // Filtered rather than cast: a tag the API knows but this build doesn't would
  // otherwise sit invisibly in state and get resubmitted, failing validation
  // with an error pointing at a tag the seller never touched.
  const [tags, setTags] = useState<ProductTagType[]>(() =>
    (product.tags ?? []).filter((tag): tag is ProductTagType =>
      (ALL_PRODUCT_TAGS as readonly string[]).includes(tag),
    ),
  );
  // `?? ""` rather than `|| ""`: stock 0 is a real value, and `0 || ""` seeded
  // the field empty — which made every out-of-stock product open dirty and then
  // fail submit with "Stock quantity is required".
  const [price, setPrice] = useState(String(product.price ?? ""));
  const [stock, setStock] = useState(String(product.stock ?? ""));
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    toVariantDrafts(product.options),
  );

  // No category picker here — category is create-only — but ProductItem carries
  // categoryId, and the server merges the ancestors, so this alone yields both
  // the sub-category's suggestions and its root's.
  const { data: suggestionData, isLoading: suggestionsLoading } =
    useCategoryVariantSuggestions(product.categoryId ?? null);

  const variantSuggestions =
    suggestionData?.suggestions.map((s) => s.name) ?? [];

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Track if form has unsaved changes (only for submitted fields)
  useEffect(() => {
    const productTags = Array.isArray(product.tags) ? product.tags : [];
    const tagsChanged =
      tags.length !== productTags.length ||
      tags.some((tag, i) => tag !== productTags[i]);

    // Compared as canonical strings, not deep-compared: `id` is regenerated on
    // every load and `draft` is transient, so a structural compare would report
    // permanently dirty. This also makes a product created before the option
    // tier open CLEAN, since canonicalOptions(undefined) === canonicalOptions([]).
    const variantsChanged =
      canonicalOptions(toOptionsPayload(variants)) !==
      canonicalOptions(product.options);

    const hasChanges =
      name !== product.name ||
      brand !== product.brand ||
      description !== product.description ||
      tagsChanged ||
      price !== String(product.price ?? "") ||
      stock !== String(product.stock ?? "") ||
      variantsChanged;

    setIsDirty(hasChanges);
  }, [name, brand, description, tags, price, stock, variants, product]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateField = (
    field: string,
    value: string | string[],
  ): string | null => {
    switch (field) {
      case "name": {
        if (typeof value !== "string") return "Invalid value";
        if (!value.trim()) {
          return "Product name is required";
        }
        if (value.length > PRODUCT_LIMITS.NAME_MAX) {
          return `Product name must be ${PRODUCT_LIMITS.NAME_MAX} characters or less`;
        }
        return null;
      }

      case "brand": {
        if (typeof value !== "string") return "Invalid value";
        if (value.length > PRODUCT_LIMITS.BRAND_MAX) {
          return `Brand name must be ${PRODUCT_LIMITS.BRAND_MAX} characters or less`;
        }
        return null;
      }

      case "description": {
        if (typeof value !== "string") return "Invalid value";
        if (!value.trim()) {
          return "Description is required";
        }
        if (value.length > PRODUCT_LIMITS.DESCRIPTION_MAX) {
          return `Description must be ${PRODUCT_LIMITS.DESCRIPTION_MAX} characters or less`;
        }
        return null;
      }

      case "price": {
        if (typeof value !== "string") return "Invalid value";
        const priceValue = Number(value);
        if (!value || value === "") {
          return "Price is required";
        }
        if (!Number.isFinite(priceValue)) {
          return "Price must be a valid number";
        }
        if (priceValue < 0.01) {
          return "Price must be at least ₱0.01";
        }
        if (priceValue > PRODUCT_LIMITS.PRICE_MAX) {
          return `Price cannot exceed ₱${PRICE_MAX_LABEL}`;
        }
        return null;
      }

      case "stock": {
        if (typeof value !== "string") return "Invalid value";
        const stockValue = Number(value);
        if (!value || value === "") {
          return "Stock quantity is required";
        }
        if (!Number.isInteger(stockValue)) {
          return "Stock must be a whole number";
        }
        if (stockValue < 0) {
          return "Stock cannot be negative";
        }
        if (stockValue > PRODUCT_LIMITS.STOCK_MAX) {
          return `Stock cannot exceed ${STOCK_MAX_LABEL} units`;
        }
        return null;
      }

      default:
        return null;
    }
  };

  const handleFieldChange =
    (field: string, setter: (value: string) => void) => (value: string) => {
      setter(value);
      clearError(field);
      if (touched[field]) {
        const error = validateField(field, value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    };

  const handleFieldBlur = (field: string, value: string) => {
    markTouched(field);
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      clearError(field);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      brand: true,
      description: true,
      price: true,
      stock: true,
    });

    // Validate all fields
    const nextErrors: Record<string, string> = {};

    const nameError = validateField("name", name);
    if (nameError) nextErrors.name = nameError;

    const brandError = validateField("brand", brand);
    if (brandError) nextErrors.brand = brandError;

    const descriptionError = validateField("description", description);
    if (descriptionError) nextErrors.description = descriptionError;

    const priceError = validateField("price", price);
    if (priceError) nextErrors.price = priceError;

    const stockError = validateField("stock", stock);
    if (stockError) nextErrors.stock = stockError;

    // Blocked rather than silently dropped: the payload builder would discard a
    // named option with no values, and the seller would never see it go.
    const orphanOption = variants.find(
      (v) => v.name.trim() && v.values.length === 0 && !v.draft.trim(),
    );
    if (orphanOption) {
      nextErrors.variants = `Add at least one value to "${orphanOption.name.trim()}", or remove the option.`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      tags,
      price: Number(price),
      stock: Number(stock),
      // `[]` when the seller cleared every option, so the server clears them;
      // `undefined` only when there were none to begin with.
      options: toOptionsPayload(variants) ?? (product.options ? [] : undefined),
    });
  };

  const fieldErrorProps = (field: string) => {
    const hasError = Boolean(errors[field]);
    return {
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${field}-error` : undefined,
    };
  };

  const getInputClass = (field: string) => {
    return errors[field]
      ? `${inputClassName} ${errorInputClassName}`
      : inputClassName;
  };

  const stockDifference = Number(stock) - product.stock;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Unsaved changes indicator */}
      {isDirty && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">You have unsaved changes</p>
        </div>
      )}

      {/* PRODUCT BASICS SECTION */}
      <div className="space-y-5 pb-6 border-b border-[var(--border-light)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Product Basics
          </h3>
        </div>

        {/* Product Name */}
        <div>
          <label
            htmlFor="edit-product-name"
            className="mb-1.5 flex items-baseline justify-between"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Product name <span className="text-red-500">*</span>
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {name.length}/{PRODUCT_LIMITS.NAME_MAX}
            </span>
          </label>
          <input
            id="edit-product-name"
            type="text"
            placeholder="Enter product name"
            maxLength={PRODUCT_LIMITS.NAME_MAX}
            value={name}
            onChange={(e) => handleFieldChange("name", setName)(e.target.value)}
            onBlur={() => handleFieldBlur("name", name)}
            className={getInputClass("name")}
            {...fieldErrorProps("name")}
            disabled={isSaving}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
          {!errors.name && touched.name && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Looks good
            </p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="edit-product-brand"
            className="mb-1.5 flex items-baseline justify-between"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Brand
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {brand.length}/{PRODUCT_LIMITS.BRAND_MAX}
            </span>
          </label>
          <input
            id="edit-product-brand"
            type="text"
            placeholder="e.g., Nike, Samsung"
            maxLength={PRODUCT_LIMITS.BRAND_MAX}
            value={brand}
            onChange={(e) =>
              handleFieldChange("brand", setBrand)(e.target.value)
            }
            onBlur={() => handleFieldBlur("brand", brand)}
            className={getInputClass("brand")}
            {...fieldErrorProps("brand")}
            disabled={isSaving}
          />
          {errors.brand && (
            <p
              id="brand-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.brand}
            </p>
          )}
        </div>
      </div>

      {/* DESCRIPTION & DETAILS SECTION */}
      <div className="space-y-5 pb-6 border-b border-[var(--border-light)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Description & Details
          </h3>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="edit-product-description"
            className="mb-1.5 flex items-baseline justify-between"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Description <span className="text-red-500">*</span>
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {description.length}/{PRODUCT_LIMITS.DESCRIPTION_MAX}
            </span>
          </label>
          <textarea
            id="edit-product-description"
            rows={5}
            placeholder="Describe your product details, features, and benefits..."
            maxLength={PRODUCT_LIMITS.DESCRIPTION_MAX}
            value={description}
            onChange={(e) =>
              handleFieldChange("description", setDescription)(e.target.value)
            }
            onBlur={() => handleFieldBlur("description", description)}
            className={`${getInputClass("description")} resize-none`}
            {...fieldErrorProps("description")}
            disabled={isSaving}
          />
          {errors.description && (
            <p
              id="description-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          )}
          {!errors.description && touched.description && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Description is complete
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Tags
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {tags.length} selected
            </span>
          </label>

          <TagSelector selected={tags} onChange={setTags} />
        </div>
      </div>

      {/* PRICING & INVENTORY SECTION */}
      <div className="space-y-5 pb-6">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Pricing & Inventory
          </h3>
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="edit-product-price"
            className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
          >
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] font-medium">
              ₱
            </span>
            <input
              id="edit-product-price"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={price}
              onChange={(e) =>
                handleFieldChange("price", setPrice)(e.target.value)
              }
              onBlur={() => handleFieldBlur("price", price)}
              className={`${getInputClass("price")} pl-7`}
              {...fieldErrorProps("price")}
              disabled={isSaving}
            />
          </div>
          {errors.price && (
            <p
              id="price-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.price}
            </p>
          )}
          {!errors.price && touched.price && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Price is valid
            </p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="edit-product-stock"
            className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
          >
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-product-stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={stock}
            onChange={(e) =>
              handleFieldChange("stock", setStock)(e.target.value)
            }
            onBlur={() => handleFieldBlur("stock", stock)}
            className={getInputClass("stock")}
            {...fieldErrorProps("stock")}
            disabled={isSaving}
          />
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Current: <span className="font-semibold">{product.stock}</span>{" "}
              units
            </p>
            {stockDifference !== 0 && (
              <p
                className={`text-xs font-medium ${
                  stockDifference > 0 ? "text-green-600" : "text-amber-600"
                }`}
              >
                {stockDifference > 0 ? "+" : ""}
                {stockDifference} units
              </p>
            )}
          </div>
          {errors.stock && (
            <p
              id="stock-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.stock}
            </p>
          )}
        </div>
      </div>

      {/* VARIANTS & OPTIONS */}
      <div className="space-y-5 pb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Variants &amp; Options
        </h3>
        <VariantsBuilder
          variants={variants}
          setVariants={setVariants}
          suggestions={variantSuggestions}
          suggestionsLoading={suggestionsLoading}
          disabled={isSaving}
          error={errors.variants}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border-light)] sm:flex-row-reverse">
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              isSaving || !isDirty
                ? "var(--border-default)"
                : "var(--brand-core)",
            color:
              isSaving || !isDirty
                ? "var(--text-secondary)"
                : "var(--background-primary)",
          }}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--background-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </span>
        </button>
      </div>
    </form>
  );
}
