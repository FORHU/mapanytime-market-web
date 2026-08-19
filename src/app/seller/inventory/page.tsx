"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  useProductsPipeline,
  ProductItem,
} from "@/shared/hooks/useProductsPipeline";
import { usePagination } from "@/shared/pagination/usePagination";
import { PaginationControls } from "@/shared/pagination/PaginationControls";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Store,
  Check,
  X,
} from "lucide-react";

export default function InventoryPage() {
  const { activeStoreId } = useActiveStore();
  const { data: stores } = useStoreProfiles();
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock"
  >("all");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [newStockValue, setNewStockValue] = useState<number>(0);

  const effectiveStoreId = activeStoreId || selectedStoreFilter || null;
  const activeStoreObj = stores?.find((s) => s.id === activeStoreId);

  const { page, limit, goTo } = usePagination(1, 10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (page !== 1) goTo(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, stockStatusFilter, selectedStoreFilter]);

  const {
    products,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    updateProduct,
    isUpdating,
  } = useProductsPipeline({
    storeId: effectiveStoreId,
    page,
    limit,
    search: debouncedSearch,
  });

  const filteredProducts = useMemo(() => {
    if (stockStatusFilter === "all") return products;
    if (stockStatusFilter === "out_of_stock") {
      return products.filter((p) => p.stock === 0);
    }
    if (stockStatusFilter === "low_stock") {
      return products.filter((p) => p.stock > 0 && p.stock <= 10);
    }
    if (stockStatusFilter === "in_stock") {
      return products.filter((p) => p.stock > 10);
    }
    return products;
  }, [products, stockStatusFilter]);

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setNewStockValue(product.stock);
  };

  const handleSaveStock = async () => {
    if (!editingProduct || !editingProduct.id) return;
    try {
      await updateProduct(
        editingProduct.id,
        {
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          stock: Number(newStockValue),
        },
        editingProduct,
      );
      setEditingProduct(null);
    } catch {
      // Error handled by pipeline
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {activeStoreObj
              ? `${activeStoreObj.storeName} — Stock levels`
              : "All Stores Stock levels"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {activeStoreObj
              ? `Monitor inventory and adjust quantities for ${activeStoreObj.storeName}.`
              : "Monitor inventory, low-stock alerts, and stock quantities across all your branches."}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
            style={{ borderColor: "var(--border-light)" }}
          />
        </div>

        {/* Store Filter Dropdown (Visible only in All Stores mode) */}
        {!activeStoreId && (
          <div className="relative sm:w-56">
            <select
              aria-label="Filter by Store"
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">All Stores</option>
              {(stores ?? []).map((store) => (
                <option key={store.id} value={store.id}>
                  {store.storeName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stock Status Filter */}
        <div className="relative sm:w-48">
          <select
            aria-label="Filter by Stock Status"
            value={stockStatusFilter}
            onChange={(e) =>
              setStockStatusFilter(
                e.target.value as
                  "all" | "in_stock" | "low_stock" | "out_of_stock",
              )
            }
            className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors"
            style={{
              background: "var(--background-secondary)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock (&gt; 10)</option>
            <option value="low_stock">Low Stock (1 - 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
          Loading stock levels…
        </div>
      )}

      {isError && (
        <div className="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl text-left text-sm text-rose-700 dark:text-rose-300">
          <strong className="font-semibold">Failed to load inventory.</strong>{" "}
          {error?.message}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          <Card
            className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="w-full overflow-auto max-h-[600px]">
              <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
                <thead>
                  <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] sticky top-0 z-10">
                    <th className="py-3.5 px-4 w-[28%]">Product</th>
                    {!activeStoreId && (
                      <th className="py-3.5 px-4 w-[20%]">Store</th>
                    )}
                    <th className="py-3.5 px-4 w-[16%]">Category</th>
                    <th className="py-3.5 px-4 text-right w-[14%]">Quantity</th>
                    <th className="py-3.5 px-4 w-[14%]">Status</th>
                    <th className="py-3.5 px-4 text-center w-[8%]">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[var(--border-light)]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={!activeStoreId ? 6 : 5}
                        className="py-12 text-center text-sm text-[var(--text-secondary)]"
                      >
                        No products match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, idx) => {
                      const isOutOfStock = product.stock === 0;
                      const isLowStock =
                        product.stock > 0 && product.stock <= 10;

                      return (
                        <tr
                          key={product.id || idx}
                          className="transition-colors hover:bg-[var(--background-secondary)]/20"
                        >
                          <td className="py-4 px-4 font-semibold text-[var(--text-primary)] truncate">
                            <div className="flex flex-col truncate">
                              <span className="truncate">{product.name}</span>
                              {product.brand && (
                                <span className="text-xs text-[var(--text-secondary)] truncate">
                                  {product.brand}
                                </span>
                              )}
                            </div>
                          </td>

                          {!activeStoreId && (
                            <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                              <div className="flex items-center gap-1.5 truncate">
                                <Store className="w-3.5 h-3.5 shrink-0 text-[var(--brand-core)]" />
                                <span className="truncate">
                                  {product.storeName || "—"}
                                </span>
                              </div>
                            </td>
                          )}

                          <td className="py-4 px-4">
                            <span
                              className="inline-block text-xs px-2 py-0.5 border rounded-md text-[var(--text-secondary)] truncate max-w-full"
                              style={{ borderColor: "var(--border-light)" }}
                            >
                              {product.category || "Uncategorized"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)]">
                            {product.stock} units
                          </td>

                          <td className="py-4 px-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                <XCircle className="w-3.5 h-3.5" /> Out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low
                                stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> In
                                stock
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(product)}
                              title="Adjust stock"
                              aria-label={`Adjust stock for ${product.name}`}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--brand-core)] hover:bg-[var(--background-secondary)] transition-colors border border-transparent hover:border-[var(--border-light)]"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <PaginationControls
            page={Math.min(page, Math.max(1, totalPages))}
            totalPages={totalPages}
            onPageChange={goTo}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 rounded-2xl bg-[var(--background-elevated)] border shadow-2xl space-y-4"
            style={{ borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Adjust Stock
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-[240px]">
                    {editingProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Quantity on hand
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewStockValue((v) => Math.max(0, v - 1))}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold hover:bg-[var(--background-tertiary)] text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={newStockValue}
                  onChange={(e) =>
                    setNewStockValue(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="flex-1 text-center py-2 px-3 text-lg font-bold border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
                <button
                  type="button"
                  onClick={() => setNewStockValue((v) => v + 1)}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold hover:bg-[var(--background-tertiary)] text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-light)]">
              <Button
                variant="secondary"
                onClick={() => setEditingProduct(null)}
                className="!text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStock}
                disabled={isUpdating}
                className="!text-xs bg-[var(--brand-core)] text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {isUpdating ? "Saving…" : "Update Stock"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
