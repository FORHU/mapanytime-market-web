"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  Package,
  Tag,
  Layers,
  Pencil,
  Trash2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  useProduct,
  useDeleteProduct,
  useCategories,
} from "../hooks/products.hooks";
import { ProductForm } from "./ProductForm";

interface ProductDetailProps {
  storeId: string;
  productId: string;
  onBack: () => void;
  onDeleted: () => void;
}

export function ProductDetail({
  storeId,
  productId,
  onBack,
  onDeleted,
}: ProductDetailProps) {
  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const { data: categories } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const deleteMutation = useDeleteProduct(storeId);

  const categoryName = product
    ? (categories?.find((cat) => cat.id === product.categoryId)?.name ??
      "Uncategorized")
    : "";

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success("Product deleted.");
      onDeleted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete this product.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-6 w-48 rounded-md bg-[var(--background-secondary)] animate-pulse" />
        <div className="h-48 rounded-2xl bg-[var(--background-secondary)] animate-pulse" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-rose-700">
          Could not load this product
        </h3>
        <p className="text-xs text-rose-600">
          {error instanceof Error ? error.message : "Product not found."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => refetch()}
            className="!w-auto bg-rose-600 hover:bg-rose-700"
          >
            Try Again
          </Button>
          <Button variant="secondary" onClick={onBack} className="!w-auto">
            Back to Catalog
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 text-left">
      <button
        onClick={onBack}
        className="text-xs font-bold underline text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
      >
        <ArrowLeft className="w-3 h-3" /> Back to Catalog
      </button>

      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[var(--brand-core)]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)]">
                {product.name}
              </h2>
              <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-0.5">
                {product.id}
              </p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="!w-auto !h-9 !text-[11px]"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button
                variant="dark"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                className="!w-auto !h-9 !text-[11px] !bg-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <ProductForm
            storeId={storeId}
            product={product}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {categoryName}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Brand
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {product.brand}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Price
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Stock
              </span>
              <p
                className={`font-medium ${
                  product.stock === undefined
                    ? "text-zinc-400"
                    : product.stock === 0
                      ? "text-rose-500"
                      : "text-emerald-500"
                }`}
              >
                {product.stock === undefined
                  ? "Not tracked on this resource"
                  : `${product.stock} units available`}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Description
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {product.description || "No description provided."}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
