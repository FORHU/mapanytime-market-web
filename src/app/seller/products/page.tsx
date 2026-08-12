"use client";

import React, { useMemo, useState } from "react";
import ProductForm from "@/features/seller-catalog/components/ProductForm";
import { ProductTable } from "@/features/seller-catalog/components/ProductTable";
import { ProductDetailDialog } from "@/features/seller-catalog/components/ProductDetailDialog";
import {
  useProductsPipeline,
  ProductItem,
} from "@/shared/hooks/useProductsPipeline";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { useStoreCategories } from "@/features/stores/hooks/useStoreCategories";
import { useSubCategories } from "@/features/stores/hooks/useSubCategories";
import { Plus, Search, X } from "lucide-react";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const {
    mainCategory,
    isLoading: storeCategoriesLoading,
    isError: storeCategoriesError,
  } = useStoreCategories(activeStoreId);

  const {
    data: subCategories,
    isLoading: subCategoriesLoading,
    isError: subCategoriesError,
  } = useSubCategories(mainCategory?.id ?? null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory]);

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
          mainCategory={mainCategory}
          storeCategoriesLoading={storeCategoriesLoading}
          storeCategoriesError={storeCategoriesError}
          subCategories={subCategories ?? []}
          subCategoriesLoading={subCategoriesLoading}
          subCategoriesError={subCategoriesError}
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
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Search by name or brand"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
                    style={{ borderColor: "var(--border-light)" }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors sm:w-52"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option
                    value="all"
                    className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                  >
                    All Categories
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-xl text-sm text-[var(--text-secondary)]">
                  No products match your search. Try a different keyword or
                  category.
                </div>
              ) : (
                <ProductTable
                  products={filteredProducts}
                  onSelect={setSelectedProduct}
                />
              )}
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
