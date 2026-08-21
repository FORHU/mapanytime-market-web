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
import { useSellerCategoryTree } from "@/features/seller-catalog/hooks/useSellerCategoryTree";
import { CategoryFilterSelect } from "@/features/seller-catalog/components/CategoryFilterSelect";
import type { SellerCategoryNode } from "@/shared/contracts/products.contract";
import { Loader2, Plus, Search, X } from "lucide-react";

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

  // Categories are scoped to the active store context, so a selection made in
  // one store would otherwise persist into the next and silently match nothing.
  useEffect(() => {
    setSelectedCategoryId("");
  }, [activeStoreId]);

  // Consume orchestrated features and handle state updates via callbacks
  const {
    products,
    total,
    totalPages,
    isLoading,
    isFetching,
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

  // The filter's own source. Unlike the two hooks above (which are store-scoped
  // and feed ProductForm), this works in All-Stores mode, where it aggregates
  // the categories across every store the seller owns.
  const {
    data: categoryTree,
    isLoading: categoryTreeLoading,
    isError: categoryTreeError,
  } = useSellerCategoryTree(activeStoreId);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const find = (nodes: SellerCategoryNode[]): string | null => {
      for (const node of nodes) {
        if (node.id === selectedCategoryId) return node.name;
        const match = find(node.children);
        if (match) return match;
      }
      return null;
    };
    return find(categoryTree ?? []);
  }, [categoryTree, selectedCategoryId]);

  const emptyStateMessage = selectedCategoryId
    ? `No products found in ${selectedCategoryName ?? "this category"}. Try another category or select "All Categories".`
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
      {!isFormOpen && !isError && (
        <div className="space-y-4">
          {/* HIDE SEARCH AND FILTERS WHEN PRODUCT DETAIL IS OPEN */}
          {!selectedProduct && (
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
              <div className="relative flex-1 min-w-[260px]">
                {isFetching ? (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    {/* animate-spin's keyframe sets `transform: rotate(...)` directly, which
                    would fight the -translate-y-1/2 above if both were on one element — so
                    the spin lives on this inner span, unpositioned. */}
                    <Loader2 className="w-4 h-4 text-[var(--text-tertiary)] animate-spin" />
                  </span>
                ) : (
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                )}
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
                className="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors w-full md:w-48"
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
              <CategoryFilterSelect
                tree={categoryTree ?? []}
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                isLoading={categoryTreeLoading}
                isError={categoryTreeError}
              />
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
              Loading your products…
            </div>
          ) : products.length === 0 && total === 0 ? (
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
              isLoading={isLoading || isFetching}
            />
          )}
        </div>
      )}
    </div>
  );
}
