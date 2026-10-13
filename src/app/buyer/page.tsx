"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Store, MapPin, Tag, Star } from "lucide-react";
import type { NearbyStore } from "@/features/stores/hooks/useNearbyStores";

// Use dynamic import for the map to prevent SSR issues
const LiveHeroMap = dynamic(() => import("@/components/home/LiveHeroMap"), {
  ssr: false,
});

export default function BuyerDashboardPage() {
  // Typed, not `any`: the panel previously read `store.name` and
  // `store.categories`, neither of which /stores/nearby returns, and nothing
  // caught it. The real fields are `storeName` and `categoryName`.
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);

  return (
    <div className="w-full h-full relative flex">
      {/* Map taking full space */}
      <div className="flex-1 h-full relative z-0">
        <LiveHeroMap onStoreClick={setSelectedStore} />
      </div>

      {/*
       * Side panel on sm and up; a bottom sheet below it, so a phone-width
       * viewport keeps most of the map visible and pannable.
       */}
      <div className="absolute inset-x-4 bottom-4 top-auto max-h-[55vh] sm:inset-auto sm:top-4 sm:right-4 sm:bottom-4 sm:max-h-none sm:w-[380px] flex flex-col gap-4 bg-surface/90 backdrop-blur-2xl p-5 rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden pointer-events-none z-20 transition-transform">
        {selectedStore ? (
          <div className="flex flex-col h-full pointer-events-auto overflow-y-auto">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-on-surface leading-tight mb-1">
                  {selectedStore.storeName}
                </h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
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
                aria-label="Close store details"
                className="w-7 h-7 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                  selectedStore.isOpen
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {selectedStore.isOpen ? "Open now" : "Closed"}
              </span>

              {selectedStore.categoryName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-medium">
                  <Tag className="w-2.5 h-2.5" />
                  {selectedStore.categoryName}
                </span>
              )}

              {selectedStore.ratingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-medium">
                  <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                  {selectedStore.rating.toFixed(1)} ({selectedStore.ratingCount}
                  )
                </span>
              )}
            </div>

            {(selectedStore.markerPhotoUrl ?? selectedStore.logoUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  selectedStore.markerPhotoUrl ?? selectedStore.logoUrl ?? ""
                }
                alt=""
                className="mt-4 w-full h-32 object-cover rounded-xl bg-surface-container"
              />
            )}

            {selectedStore.description && (
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant line-clamp-3">
                {selectedStore.description}
              </p>
            )}

            <div className="mt-auto pt-4">
              <Link
                href={`/store/${selectedStore.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all"
              >
                <Store className="w-4 h-4" /> Browse Store
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant pointer-events-auto">
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
