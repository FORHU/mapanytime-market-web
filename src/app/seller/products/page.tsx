"use client";

import React, { useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import ProductForm from "@/features/seller-catalog/components/ProductForm";
import { ProductDetailDialog } from "@/features/seller-catalog/components/ProductDetailDialog";
import {
  useProductsPipeline,
  ProductItem,
} from "@/shared/hooks/useProductsPipeline";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { Plus, X, Tag, Layers } from "lucide-react";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const { activeStoreId } = useActiveStore();

  // Consume orchestrated features and handle state updates via callbacks
  const {
    products,
    isLoading,
    isError,
    error,
    addProduct,
    isAdding,
    deleteProduct,
    isDeleting,
  } = useProductsPipeline(activeStoreId, () => {
    setIsFormOpen(false); // Callback triggered on mutation success
  });

  const handleAddProductSuccess = (newProduct: ProductItem) => {
    return addProduct(newProduct);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control Header */}
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            My products
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Everything you sell, with prices and stock.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          disabled={isAdding}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-white bg-[var(--brand-core)] hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
        >
          {isFormOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isFormOpen ? "Cancel" : "Add product"}
        </button>
      </div>

      {/* ASYNC STATE RENDERING ELEMENT TILES */}
      {isLoading && (
        <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
          Loading your products…
        </div>
      )}

      {isError && (
        <div className="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl text-left text-sm text-rose-700 dark:text-rose-300">
          <strong className="font-semibold">
            We couldn&apos;t load your products.
          </strong>{" "}
          {error?.message}
        </div>
      )}

      {/* 1. SHOW THE FORM ONLY WHEN OPEN */}
      {isFormOpen && (
        <ProductForm
          onSuccess={handleAddProductSuccess}
          closeForm={() => setIsFormOpen(false)}
        />
      )}

      {/* 2. ONLY SHOW THE PRODUCTS GRID IF THE FORM IS CLOSED */}
      {!isFormOpen && !isLoading && !isError && (
        <>
          {products.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl text-sm text-[var(--text-secondary)]">
              You haven&apos;t added any products yet. Tap &quot;Add
              product&quot; to list your first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {products.map((product, idx) => (
                <Card
                  key={product.id || idx}
                  hoverable
                  className="p-5 flex flex-col justify-between text-left"
                  style={{ borderColor: "var(--border-light)" }}
                  onClick={() => setSelectedProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedProduct(product);
                    }
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <span className="text-sm text-[var(--text-secondary)] block mt-0.5">
                            by {product.brand}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs px-2 py-1 border rounded-md text-[var(--text-secondary)] shrink-0"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        {product.category}
                      </span>
                    </div>
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {product.description || "No description yet."}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3 border-t text-sm font-medium text-[var(--text-secondary)]"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span className="text-[var(--text-primary)] font-semibold">
                        ₱
                        {Number(product.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span
                        className={
                          product.stock === 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {product.stock === 0
                          ? "Out of stock"
                          : `${product.stock} in stock`}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductDetailDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDelete={(id) =>
            deleteProduct(id).then(() => setSelectedProduct(null))
          }
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
