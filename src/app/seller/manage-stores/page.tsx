"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreOnboardingForm } from "@/features/stores";
import StoreManagementDashboard from "@/features/stores/components/StoreManagementDashboard";
import { useStores } from "@/features/stores/hooks/useStores";

export default function ManageStoresPage() {
  const [view, setView] = useState<"LIST" | "ONBOARDING">("LIST");
  const { data: stores, isLoading, isError, error } = useStores();
  const router = useRouter();

  const handleSelectStore = (storeId: string) => {
    localStorage.setItem("active_store_context_id", storeId);
    router.push("/seller/dashboard");
  };

  const handleCreateStoreSuccess = () => {
    setView("LIST");
  };

  return (
    <div className="py-4">
      {view === "LIST" ? (
        <>
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
              stores={(stores ?? []).map((store) => ({
                id: store.id,
                storeName: store.storeName,
                isActive: store.isActive,
                city: store.storeLocations?.city,
                province: store.storeLocations?.province,
              }))}
              onSelectStore={handleSelectStore}
              onCreateNewStore={() => setView("ONBOARDING")}
            />
          )}
        </>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setView("LIST")}
            className="text-sm font-medium underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] block text-left mb-2"
          >
            ← Back to my stores
          </button>
          <StoreOnboardingForm onComplete={handleCreateStoreSuccess} />
        </div>
      )}
    </div>
  );
}
