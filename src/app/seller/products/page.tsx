"use client";

import React, { useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import ProductForm from "@/features/seller-catalog/components/ProductForm";
import {
  useProductsPipeline,
  ProductItem,
} from "@/shared/hooks/useProductsPipeline";
import { Plus, X, Tag, Layers } from "lucide-react";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Consume orchestrated features and handle state updates via callbacks
  const { products, isLoading, isError, error, addProduct, isAdding } =
    useProductsPipeline(() => {
      setIsFormOpen(false); // Callback triggered on mutation success
    });

  const handleAddProductSuccess = (newProduct: ProductItem) =>
    addProduct(newProduct);

  return (
    <div className="space-y-6">
      {/* Top Banner Control Header */}
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="text-left">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Product Catalog Management
          </h1>
          <p className="text-xs text-zinc-400">
            Review catalog listings and alter pricing specifications.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          disabled={isAdding}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isFormOpen ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {isFormOpen ? "Cancel" : "Add Product"}
        </button>
      </div>

      {/* ASYNC STATE RENDERING ELEMENT TILES */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-zinc-400 font-semibold animate-pulse">
          Synchronizing product database maps...
        </div>
      )}

      {isError && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-left text-xs text-red-600">
          <strong>Catalog Query Failure:</strong> {error?.message}
        </div>
      )}

      {/* 1. SHOW THE FORM ONLY WHEN OPEN */}
      {isFormOpen && (
        <Card className="p-6 transition-all animate-in fade-in-50 duration-200">
          <h2 className="text-sm font-black mb-4 text-left">
            New Product Registration Manifest
          </h2>
          <ProductForm
            onSuccess={handleAddProductSuccess}
            closeForm={() => setIsFormOpen(false)}
          />
          {isAdding && (
            <p className="text-[10px] text-zinc-400 mt-2 text-left">
              Committing registration to node stream...
            </p>
          )}
        </Card>
      )}

      {/* 2. ONLY SHOW THE PRODUCTS GRID IF THE FORM IS CLOSED */}
      {!isFormOpen && !isLoading && !isError && (
        <>
          {products.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl text-xs text-zinc-400">
              No products found in the database. click &quot;Add Product&quot;
              to create your first entry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {products.map((product, idx) => (
                <Card
                  key={product.id || idx}
                  className="p-5 flex flex-col justify-between text-left border hover:shadow-sm"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-sm font-black tracking-tight text-text-primary">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                          by {product.brand}
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider text-zinc-400 shrink-0"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        {product.category}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mb-4 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {product.description || "No description provided."}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3 border-t text-[11px] font-semibold text-zinc-500"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>${parseFloat(product.price).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span
                        className={
                          product.stock === 0
                            ? "text-rose-500"
                            : "text-emerald-500"
                        }
                      >
                        {product.stock} units available
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
