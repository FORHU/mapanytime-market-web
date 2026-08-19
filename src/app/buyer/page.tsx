"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Store,
  MapPin,
  Tag,
  Flame,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import {
  PromotionsNearYouCarousel,
  PromotionDealItem,
} from "@/features/promotions/components/PromotionsNearYouCarousel";
import { FloatingMapDealCard } from "@/features/promotions/components/FloatingMapDealCard";

// Use dynamic import for the map to prevent SSR issues
const LiveHeroMap = dynamic(() => import("@/components/home/LiveHeroMap"), {
  ssr: false,
});

export default function BuyerDashboardPage() {
  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  const handleSelectDeal = (deal: PromotionDealItem) => {
    // Open the store inspector for the deal's store
    setSelectedStore({
      id: deal.storeId,
      name: deal.storeName,
      storeName: deal.storeName,
      isActive: true,
      categoryName: deal.category,
      featuredDeal: deal,
      address: {
        currentAddress: `${Math.round(deal.distanceKm * 1000)}m from your current location`,
        city: "Baguio City",
      },
    });
  };

  return (
    <div className="w-full h-full relative flex overflow-hidden">
      {/* Map taking full space */}
      <div className="flex-1 h-full relative z-0">
        <LiveHeroMap onStoreClick={setSelectedStore} />

        {/* Floating Map Deal Card at Bottom Center */}
        {!selectedStore && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-20 flex justify-center sm:justify-start pointer-events-none">
            <FloatingMapDealCard onSelectDeal={handleSelectDeal} />
          </div>
        )}
      </div>

      {/* Floating Panel for Selected Store or Promotions Feed */}
      <div className="absolute top-4 right-4 left-4 sm:left-auto bottom-4 sm:w-[420px] flex flex-col gap-4 bg-[var(--background-elevated)]/95 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-[var(--border-default)] overflow-y-auto pointer-events-auto z-20 transition-all text-left">
        {selectedStore ? (
          <div className="flex flex-col h-full pointer-events-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight mb-1">
                  {selectedStore.name || selectedStore.storeName}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-core)] shrink-0" />
                  {[
                    selectedStore.address?.currentAddress,
                    selectedStore.address?.city,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Local store"}
                </p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="w-7 h-7 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedStore.featuredDeal && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    🔥 Active Promo
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedStore.featuredDeal.badgeLabel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {selectedStore.featuredDeal.title}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {selectedStore.featuredDeal.discountSummary}
                </p>
              </div>
            )}

            {selectedStore.categories &&
              selectedStore.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedStore.categories
                    .slice(0, 3)
                    .map((cat: any, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--background-secondary)] text-[var(--text-secondary)] text-[11px] font-medium border border-[var(--border-light)]"
                      >
                        <Tag className="w-3 h-3 text-[var(--brand-core)]" />
                        {cat.name}
                      </span>
                    ))}
                </div>
              )}

            <div className="mt-auto p-4 rounded-2xl bg-[var(--background-secondary)] flex flex-col items-center justify-center text-center space-y-2 border border-[var(--border-light)]">
              <Store className="w-8 h-8 text-[var(--brand-core)] opacity-80" />
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Pick up in-store today
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Browse this store&apos;s active catalog, reserve stock, and pick
                up order when ready.
              </p>
              <button className="mt-2 w-full py-2.5 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Products & Order</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-5">
            {/* Promotions Near You Rail */}
            <PromotionsNearYouCarousel onSelectDeal={handleSelectDeal} />

            <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-light)] text-left space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--brand-core)]" />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Hyperlocal Pickup Marketplace
                </h4>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Click any store pin on the map or select a promotion card above
                to browse items, order ahead, and pick up without waiting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
