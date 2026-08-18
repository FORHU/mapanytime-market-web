"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Store, MapPin, Tag } from "lucide-react";

// Use dynamic import for the map to prevent SSR issues
const LiveHeroMap = dynamic(() => import("@/components/home/LiveHeroMap"), {
  ssr: false,
});

export default function BuyerDashboardPage() {
  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  return (
    <div className="w-full h-full relative flex">
      {/* Map taking full space */}
      <div className="flex-1 h-full relative z-0">
        <LiveHeroMap onStoreClick={setSelectedStore} />
      </div>

      {/* Floating Panel for Selected Store (similar to the landing page) */}
      <div className="absolute top-4 right-4 left-4 sm:left-auto bottom-4 sm:w-[380px] flex flex-col gap-4 bg-surface/90 backdrop-blur-2xl p-5 rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden pointer-events-none z-20 transition-transform">
        {selectedStore ? (
          <div className="flex flex-col h-full pointer-events-auto">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-on-surface leading-tight mb-1">
                  {selectedStore.name}
                </h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary" />
                  {/*
                   * `address` is an object — { currentAddress, city, province,
                   * country } — built by StoreRepository.findNearbyStores.
                   * Rendering it directly threw "Objects are not valid as a
                   * React child". Matches the shape used in ExploreMapSection
                   * and LiveHeroMap.
                   */}
                  {[
                    selectedStore.address?.currentAddress,
                    selectedStore.address?.city,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Address not provided"}
                </p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedStore.categories &&
              selectedStore.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedStore.categories
                    .slice(0, 3)
                    .map((cat: any, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-medium"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {cat.name}
                      </span>
                    ))}
                </div>
              )}

            <div className="mt-4 p-4 rounded-xl bg-surface-container flex-1 flex flex-col items-center justify-center text-center">
              <Store className="w-8 h-8 text-on-surface-variant mb-2 opacity-50" />
              <p className="text-sm font-medium text-on-surface mb-1">
                Store Details
              </p>
              <p className="text-xs text-on-surface-variant">
                View products, menus, and place orders directly from here in the
                future.
              </p>
              <button className="mt-4 w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
                Browse Store
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
            <MapPin className="w-12 h-12 mb-4 opacity-20 text-primary" />
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Explore the Map
            </h3>
            <p className="text-sm">
              Click on any store pin on the map to view their details, browse
              their products, and make purchases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
