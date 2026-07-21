"use client";

import React, { useState } from "react";
import { useActiveStore } from "@/features/stores";
import { useProducts } from "@/features/products";
import {
  InventoryList,
  InventoryDetail,
  useInventoryItems,
} from "@/features/inventory";
import { Card } from "@/shared/components/ui/Card";

type InventoryView = { mode: "LIST" } | { mode: "DETAIL"; productId: string };

export default function InventoryPage() {
  const { activeStoreId, isHydrated } = useActiveStore();
  const storeId = activeStoreId ?? "";

  const [view, setView] = useState<InventoryView>({ mode: "LIST" });
  const { data: products, isLoading, error, refetch } = useProducts(storeId);
  const items = useInventoryItems(products);

  if (!isHydrated) {
    return null;
  }

  if (!storeId) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto space-y-2">
        <p className="text-xs text-zinc-400">
          Select a store before viewing its inventory.
        </p>
      </Card>
    );
  }

  if (view.mode === "DETAIL") {
    const item = items.find((i) => i.productId === view.productId);
    if (item) {
      return (
        <InventoryDetail item={item} onBack={() => setView({ mode: "LIST" })} />
      );
    }
  }

  return (
    <InventoryList
      items={items}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      onSelectItem={(productId) => setView({ mode: "DETAIL", productId })}
    />
  );
}
