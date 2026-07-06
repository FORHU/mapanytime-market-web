"use client";

import React, { useState, useEffect } from "react";
import StoreManagementDashboard from "@/features/auth/components/StoreManagementDashboard";
import StoreOnboardingForm from "@/features/auth/components/StoreOnboardingForm";
import { useRouter } from "next/navigation";

interface StoreItem {
  id: string;
  name: string;
  category: string;
  coordinates: string;
}

export default function ManageStoresPage() {
  const router = useRouter();
  const [view, setView] = useState<"LIST" | "ONBOARDING">("LIST");

  // 💡 SEPARATE DATA DOMAIN: Track multiple in-memory branches securely
  const [stores, setStores] = useState<StoreItem[]>([
    {
      id: "store_01",
      name: "Session Road Electronics",
      category: "retail",
      coordinates: "16.4112° N, 120.5954° E | Session Rd, Baguio",
    },
    {
      id: "store_02",
      name: "Magsaysay Fresh Hub",
      category: "groceries",
      coordinates: "16.4195° N, 120.5910° E | Magsaysay Ave, Baguio",
    },
  ]);

  const handleSelectStore = (storeId: string) => {
    // Save token reference context in LocalStorage to establish the environment session
    localStorage.setItem("active_store_context_id", storeId);

    // Force immediate sync refresh and redirect to isolated dashboard parameters
    window.location.href = "/seller/dashboard";
  };

  const handleCreateStoreSuccess = () => {
    // Generate a new unique mock node segment
    const newStore: StoreItem = {
      id: `store_${Date.now()}`,
      name: "New Baguio Market Extension",
      category: "retail",
      coordinates: "16.4164° N, 120.5931° E | City Center, Baguio",
    };

    setStores((prev) => [...prev, newStore]);
    setView("LIST");
  };

  return (
    <div className="py-4">
      {view === "LIST" ? (
        <StoreManagementDashboard
          stores={stores}
          onSelectStore={handleSelectStore}
          onCreateNewStore={() => setView("ONBOARDING")}
        />
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setView("LIST")}
            className="text-xs font-bold underline text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 block text-left mb-2"
          >
            ← Back to Store Selector Node
          </button>
          <StoreOnboardingForm onComplete={handleCreateStoreSuccess} />
        </div>
      )}
    </div>
  );
}
