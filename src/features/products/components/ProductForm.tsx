"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { ProductFormCore } from "@/shared/components/forms/ProductFormCore";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import { UploadCloud, ImageOff, AlertCircle } from "lucide-react";
import {
  useCreateProduct,
  useUpdateProduct,
  useCategories,
} from "../hooks/products.hooks";
import type { Product } from "../contracts/products.contract";

interface ProductFormProps {
  storeId: string;
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

function firstFieldErrors(
  fields: Record<string, string[]>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(([field, messages]) => [field, messages[0]]),
  );
}

export function ProductForm({
  storeId,
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEditing = Boolean(product);

  // Name/brand/description/price still go through the shared ProductFormCore.
  // Stock and category are handled separately below — the real backend
  // contract for them (initialStock, categoryId) doesn't match the generic
  // enum/stock fields ProductFormCore renders for its other two callers
  // (ai-upload, stores AI-catalog), so those are hidden here instead of
  // changed for everyone.
  const [form, setForm] = useState({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
  });
  const [initialStock, setInitialStock] = useState(0);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [imageKey, setImageKey] = useState<string | undefined>(
    product?.imageKey || undefined,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const imageUpload = useS3AssetUpload();

  const createMutation = useCreateProduct(storeId, {
    onValidationError: (fields) => setFieldErrors(firstFieldErrors(fields)),
  });
  const updateMutation = useUpdateProduct(product?.id ?? "", storeId, {
    onValidationError: (fields) => setFieldErrors(firstFieldErrors(fields)),
  });

  const isSaving = isEditing
    ? updateMutation.isPending
    : createMutation.isPending;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imageUpload.mutate(file, {
      onSuccess: (data) => setImageKey(data.fileKey),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          name: form.name,
          brand: form.brand,
          description: form.description,
          price: form.price,
          categoryId,
        });
        toast.success("Product updated.");
      } else {
        await createMutation.mutateAsync({
          storeId,
          name: form.name,
          brand: form.brand,
          description: form.description,
          price: form.price,
          initialStock,
          categoryId,
        });
        toast.success("Product created.");
      }
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save this product.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductFormCore
        values={{ ...form, stock: 0 }}
        errors={fieldErrors}
        onChange={handleChange}
        hideStock
        hideCategory
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {!isEditing && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Initial Stock
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={initialStock || ""}
              onChange={(e) => setInitialStock(Number(e.target.value))}
              className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
              style={{ borderColor: "var(--border-light)" }}
            />
            {fieldErrors.initialStock && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.initialStock}
              </p>
            )}
          </div>
        )}

        <div className={`space-y-1 ${isEditing ? "sm:col-span-2" : ""}`}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categoriesLoading}
            className="w-full px-3 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)] appearance-none cursor-pointer disabled:opacity-50"
            style={{ borderColor: "var(--border-light)" }}
          >
            <option value="" disabled>
              {categoriesLoading
                ? "Loading categories..."
                : "Select a category"}
            </option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.categoryId}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1 text-left">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Product Image
        </label>
        <div
          className="relative flex items-center justify-center gap-2 border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          style={{ borderColor: "var(--border-light)" }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={imageUpload.isPending}
          />
          {imageKey ? (
            <UploadCloud className="w-4 h-4 text-emerald-500" />
          ) : (
            <ImageOff className="w-4 h-4 text-zinc-400" />
          )}
          <span className="text-[11px] text-zinc-500">
            {imageUpload.isPending
              ? "Uploading..."
              : imageKey
                ? "Image attached — click to replace"
                : "Select a product photo (optional)"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button
          type="submit"
          isLoading={isSaving}
          className="!w-auto !h-9 !text-[11px]"
        >
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="!w-auto !h-9 !text-[11px]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
