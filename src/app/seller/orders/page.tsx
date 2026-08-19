"use client";

import React from "react";
import { SellerOrdersBoard } from "@/features/orders/components/SellerOrdersBoard";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";

export default function OrdersPage() {
  const { activeStoreId } = useActiveStore();
  const { data: stores } = useStoreProfiles();

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Orders
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Track every order and move it along as you prepare it for pickup.
        </p>
      </div>

      <SellerOrdersBoard
        variant="full"
        activeStoreId={activeStoreId}
        stores={stores}
      />
    </div>
  );
}
