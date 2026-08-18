"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductForm from "@/features/seller-catalog/components/ProductForm";
import { ProductTable } from "@/features/seller-catalog/components/ProductTable";
import { ProductDetail } from "@/features/seller-catalog/components/ProductDetailDialog";
import {
  useProductsPipeline,
  ProductItem,
} from "@/shared/hooks/useProductsPipeline";
import { usePagination } from "@/shared/pagination/usePagination";
import { PaginationControls } from "@/shared/pagination/PaginationControls";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const { activeStoreId } = useActiveStore();

  const { page, limit, goTo } = usePagination(1, 10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (page !== 1) goTo(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryId, sortDirection]);

  // Consume orchestrated features and handle state updates via callbacks
  const {
    products,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    addProduct,
    isAdding,
    deleteProduct,
    isDeleting,
    updateProduct,
    isUpdating,
  } = useProductsPipeline({
    storeId: activeStoreId,
    page,
    limit,
    search: debouncedSearch,
    categoryId: selectedCategoryId || undefined,
    sortBy: sortDirection ? "price" : undefined,
    sortOrder: sortDirection ?? undefined,
    onMutationSuccess: () => setIsFormOpen(false),
  });

  // Clamp an out-of-range page (e.g. the last item on page 5 was archived).
  useEffect(() => {
    if (!isLoading && totalPages > 0 && page > totalPages) {
      goTo(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, isLoading]);

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

  const categoryOptions = useMemo(
    () => (subCategories ?? []).map((c) => ({ id: c.id, name: c.name })),
    [subCategories],
  );

  const emptyStateMessage = selectedCategoryId
    ? 'No products found in this category. Try another category or select "All Categories".'
    : debouncedSearch
      ? "No products match your search. Try a different keyword."
      : 'You haven\'t added any products yet. Tap "Add product" to list your first one.';

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
        {activeStoreId ? (
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
        ) : (
          <button
            disabled
            title="Please select a specific store from the sidebar to add a product"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-white bg-[var(--brand-core)] opacity-50 cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        )}
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
        <div className="space-y-4">
          {/* HIDE SEARCH AND FILTERS WHEN PRODUCT DETAIL IS OPEN */}
          {!selectedProduct && (
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
                aria-label="Sort by Price"
                value={sortDirection ?? ""}
                onChange={(e) =>
                  setSortDirection((e.target.value as "asc" | "desc") || null)
                }
                className="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors sm:w-48"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option
                  value=""
                  className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                >
                  Sort by Price
                </option>
                <option
                  value="asc"
                  className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                >
                  Price: Low → High
                </option>
                <option
                  value="desc"
                  className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                >
                  Price: High → Low
                </option>
              </select>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors sm:w-52"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option
                  value=""
                  className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                >
                  All Categories
                </option>
                {categoryOptions.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {products.length === 0 && total === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl text-sm text-[var(--text-secondary)]">
              {emptyStateMessage}
            </div>
          ) : products.length === 0 && total > 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
              Loading products…
            </div>
          ) : selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onDelete={(id) =>
                deleteProduct(id).then(() => setSelectedProduct(null))
              }
              isDeleting={isDeleting}
              onUpdate={(id, input) =>
                updateProduct(id, input, selectedProduct).then((updated) => {
                  setSelectedProduct(updated);
                  return updated;
                })
              }
              isUpdating={isUpdating}
            />
          ) : (
            <ProductTable
              products={products}
              onSelect={setSelectedProduct}
              showStoreColumn={!activeStoreId}
            />
          )}

          {/* HIDE PAGINATION WHEN PRODUCT DETAIL IS OPEN */}
          {!selectedProduct && (
            <PaginationControls
              page={Math.min(page, Math.max(1, totalPages))}
              totalPages={totalPages}
              onPageChange={goTo}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}
