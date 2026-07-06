"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import ProductForm from "@/features/seller-catalog/components/ProductForm";
import { Plus, X, Package, Tag, Layers } from "lucide-react";

interface ProductItem {
  name: string;
  price: string;
  sku: string;
  category: string;
  description: string;
  stock: number;
}

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 📦 IN-MEMORY CATALOG STATE: Simulates your database fetch layer
  const [products, setProducts] = useState<ProductItem[]>([
    {
      name: "Hyperlocal Premium Coffee Beans",
      price: "18.50",
      sku: "COF-PREM-01",
      category: "home",
      description:
        "Direct-trade organic robusta beans mapped to physical checkout nodes.",
      stock: 120,
    },
  ]);

  const handleAddProductSuccess = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
    setIsFormOpen(false); // Close form panel instantly upon generation
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog Management"
        description="Review catalog listings, alter pricing specifications, and audit digital marketplace channels."
        action={
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all"
          >
            {isFormOpen ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isFormOpen ? "Cancel" : "Add Product"}
          </button>
        }
      />

      {/* Conditionally Render the Asset Registration Form Input View */}
      {isFormOpen && (
        <Card className="p-6 transition-all animate-in fade-in-50 duration-200">
          <h2 className="text-sm font-black mb-4 text-left">
            New Product Registration Manifest
          </h2>
          <ProductForm onSuccess={handleAddProductSuccess} />
        </Card>
      )}

      {/* Product Catalog Records Dynamic Render Layer */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center py-20">
              <div className="text-sm font-bold mb-1">
                No Active Listings Loaded
              </div>
              <p
                className="text-xs max-w-sm mx-auto mb-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                Digitalize items via the AI uploader or manual tools to
                distribute listings to localized map channels.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <Card
                key={idx}
                className="p-5 flex flex-col justify-between text-left border hover:shadow-sm transition-shadow"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm font-black tracking-tight text-text-primary">
                      {product.name}
                    </h3>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider text-zinc-400"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      {product.sku}
                    </span>
                  </div>
                  <p
                    className="text-[11px] mb-4 line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {product.description ||
                      "No description provided for this catalog item."}
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
      </div>
    </div>
  );
}
