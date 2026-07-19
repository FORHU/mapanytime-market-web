"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Package, Plus, Tag, Layers, AlertCircle } from "lucide-react";
import { useCategories } from "../hooks/products.hooks";
import type { Product } from "../contracts/products.contract";

interface ProductCatalogProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onSelectProduct: (productId: string) => void;
  onCreateNewProduct: () => void;
}

export function ProductCatalog({
  products,
  isLoading,
  error,
  onRetry,
  onSelectProduct,
  onCreateNewProduct,
}: ProductCatalogProps) {
  const { data: categories } = useCategories();
  const categoryName = (categoryId: string) =>
    categories?.find((cat) => cat.id === categoryId)?.name ?? "Uncategorized";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 rounded-2xl bg-[var(--background-secondary)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-rose-700">
          Could not load your products
        </h3>
        <p className="text-xs text-rose-600">{error.message}</p>
        <Button
          onClick={onRetry}
          className="!w-auto mx-auto bg-rose-600 hover:bg-rose-700"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Product Catalog
          </h1>
          <p className="text-xs text-zinc-400">
            Manage the products listed under this store.
          </p>
        </div>
        <button
          onClick={onCreateNewProduct}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center py-20 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black mb-1">No Products Yet</h2>
          <p className="text-xs max-w-sm mx-auto text-zinc-400 mb-6">
            This store has no catalog listings. Add your first product to start
            selling.
          </p>
          <button
            onClick={onCreateNewProduct}
            className="px-4 py-2 text-xs font-bold rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
            style={{ borderColor: "var(--border-light)" }}
          >
            Add First Product
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="p-5 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group cursor-pointer"
              style={{ borderColor: "var(--border-light)" }}
              onClick={() => onSelectProduct(product.id)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-text-primary group-hover:text-brand-core transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      {product.brand}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider text-zinc-400 shrink-0">
                    {categoryName(product.categoryId)}
                  </span>
                </div>
                <p className="text-[11px] line-clamp-2 text-[var(--text-secondary)]">
                  {product.description || "No description provided."}
                </p>
              </div>

              <div
                className="flex items-center justify-between pt-3 mt-4 border-t text-[11px] font-semibold text-zinc-500"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span
                    className={
                      product.stock === undefined
                        ? "text-zinc-400"
                        : product.stock === 0
                          ? "text-rose-500"
                          : "text-emerald-500"
                    }
                  >
                    {product.stock === undefined
                      ? "Stock N/A"
                      : `${product.stock} in stock`}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
