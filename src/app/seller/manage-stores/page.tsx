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
            <div className="p-8 text-center text-xs text-zinc-400 font-semibold animate-pulse">
              Loading your stores...
            </div>
          )}
          {isError && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-left text-xs text-red-600">
              <strong>Could not load stores:</strong> {error?.message}
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
            className="text-xs font-bold underline text-zinc-400 hover:text-zinc-600 block text-left mb-2"
          >
            ← Back to Store Selector Node
          </button>
          <StoreOnboardingForm onComplete={handleCreateStoreSuccess} />
        </div>
      )}
    </div>
  );
}
