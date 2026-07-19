"use client";

import React, { useState } from "react";
import { useActiveStore } from "@/features/stores";
import {
  ProductCatalog,
  ProductForm,
  ProductDetail,
  useProducts,
} from "@/features/products";
import { Card } from "@/shared/components/ui/Card";

type ProductsView =
  { mode: "LIST" } | { mode: "CREATE" } | { mode: "DETAIL"; productId: string };

export default function ProductsPage() {
  const { activeStoreId, isHydrated } = useActiveStore();
  const storeId = activeStoreId ?? "";

  const [view, setView] = useState<ProductsView>({ mode: "LIST" });
  const { data: products, isLoading, error, refetch } = useProducts(storeId);

  if (!isHydrated) {
    return null;
  }

  if (!storeId) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto space-y-2">
        <p className="text-xs text-zinc-400">
          Select a store before managing its product catalog.
        </p>
      </Card>
    );
  }

  if (view.mode === "CREATE") {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <button
          onClick={() => setView({ mode: "LIST" })}
          className="text-xs font-bold underline text-zinc-400 hover:text-zinc-600 block text-left"
        >
          ← Back to Catalog
        </button>
        <Card className="p-6">
          <h2 className="text-sm font-black mb-4 text-left">New Product</h2>
          <ProductForm
            storeId={storeId}
            onSuccess={() => setView({ mode: "LIST" })}
            onCancel={() => setView({ mode: "LIST" })}
          />
        </Card>
      </div>
    );
  }

  if (view.mode === "DETAIL") {
    return (
      <ProductDetail
        storeId={storeId}
        productId={view.productId}
        onBack={() => setView({ mode: "LIST" })}
        onDeleted={() => setView({ mode: "LIST" })}
      />
    );
  }

  return (
    <ProductCatalog
      products={products ?? []}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      onSelectProduct={(productId) => setView({ mode: "DETAIL", productId })}
      onCreateNewProduct={() => setView({ mode: "CREATE" })}
    />
  );
}
