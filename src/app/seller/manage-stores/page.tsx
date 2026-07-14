"use client";

import React, { useState } from "react";
import {
  StoreManagementDashboard,
  StoreOnboardingForm,
} from "@/features/stores";

interface StoreItem {
  id: string;
  name: string;
  category: string;
  coordinates: string;
}

export default function ManageStoresPage() {
  const [view, setView] = useState<"LIST" | "ONBOARDING">("LIST");
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
    localStorage.setItem("active_store_context_id", storeId);
    window.location.href = "/seller/dashboard";
  };

  const handleCreateStoreSuccess = (storeId: string) => {
    const newStore: StoreItem = {
      id: storeId,
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
