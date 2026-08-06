"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreTypeSelectionModal, type StoreType } from "@/features/stores";
import StoreManagementDashboard from "@/features/stores/components/StoreManagementDashboard";
import { useStores } from "@/features/stores/hooks/useStores";
import { useProperties } from "@/features/properties/hooks/useProperties";

export default function ManageStoresPage() {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const storesQuery = useStores();
  const propertiesQuery = useProperties();
  const router = useRouter();

  const isLoading = storesQuery.isLoading || propertiesQuery.isLoading;
  const isError = storesQuery.isError || propertiesQuery.isError;
  const error = storesQuery.error ?? propertiesQuery.error;

  const handleSelectStore = (storeId: string) => {
    localStorage.setItem("active_store_context_id", storeId);
    router.push("/seller/dashboard");
  };

  const handleSelectStoreType = (type: StoreType) => {
    setShowTypeModal(false);
    router.push(`/seller/onboarding/${type}`);
  };

  return (
    <div className="py-4">
      {isLoading && (
        <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
          Loading your stores…
        </div>
      )}
      {isError && (
        <div className="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl text-left text-sm text-rose-700 dark:text-rose-300">
          <strong className="font-semibold">
            We couldn&apos;t load your stores.
          </strong>{" "}
          {error?.message}
        </div>
      )}
      {!isLoading && !isError && (
        <StoreManagementDashboard
          stores={(storesQuery.data ?? []).map((store) => ({
            id: store.id,
            storeName: store.storeName,
            isActive: store.isActive,
            approvalStatus: store.approvalStatus,
            rejectionReason: store.rejectionReason,
            city: store.storeLocations?.city,
            province: store.storeLocations?.province,
          }))}
          properties={propertiesQuery.data ?? []}
          onSelectStore={handleSelectStore}
          onCreateNewStore={() => setShowTypeModal(true)}
        />
      )}
      <StoreTypeSelectionModal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleSelectStoreType}
      />
    </div>
  );
}
