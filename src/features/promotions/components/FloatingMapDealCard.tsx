"use client";

import React, { useState } from "react";
import {
  Flame,
  Tag,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
  ArrowRight,
} from "lucide-react";
import type { PromotionDealItem } from "./PromotionsNearYouCarousel";

interface FloatingMapDealCardProps {
  deals?: PromotionDealItem[];
  onSelectDeal?: (deal: PromotionDealItem) => void;
  onClose?: () => void;
}

const DEFAULT_MAP_DEALS: PromotionDealItem[] = [
  {
    id: "deal-1",
    storeId: "store-baguio-brew",
    storeName: "Baguio Craft Coffee",
    title: "20% OFF Handcrafted Pour-over",
    badgeLabel: "20% OFF",
    discountSummary: "All single-origin brews & signature lattes",
    distanceKm: 0.4,
    expiresInHours: 4,
    category: "Cafe & Drinks",
    isSponsored: true,
  },
  {
    id: "deal-2",
    storeId: "store-session-bake",
    storeName: "Session Road Bakery",
    title: "Buy 1 Get 1 Sourdough Pastries",
    badgeLabel: "BOGO",
    discountSummary: "Freshly baked morning croissants & sourdough",
    distanceKm: 0.8,
    expiresInHours: 6,
    category: "Bakery",
    isSponsored: false,
  },
];

export function FloatingMapDealCard({
  deals = DEFAULT_MAP_DEALS,
  onSelectDeal,
  onClose,
}: FloatingMapDealCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !deals || deals.length === 0) return null;

  const currentDeal = deals[currentIndex % deals.length];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
  };

  return (
    <div
      onClick={() => onSelectDeal?.(currentDeal)}
      className="p-3.5 rounded-2xl bg-[var(--background-elevated)]/95 backdrop-blur-xl border shadow-2xl transition-all hover:shadow-primary/10 cursor-pointer w-full max-w-sm sm:max-w-md pointer-events-auto border-[var(--border-default)] space-y-2.5 animate-in slide-in-from-bottom-3 duration-300"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />{" "}
            {currentDeal.badgeLabel}
          </span>
          <span className="text-[10px] font-semibold text-[var(--brand-core)] flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {currentDeal.distanceKm < 1
              ? `${Math.round(currentDeal.distanceKm * 1000)}m away`
              : `${currentDeal.distanceKm}km`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {deals.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-5 h-5 rounded-md hover:bg-[var(--background-secondary)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
                aria-label="Previous deal"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                {currentIndex + 1}/{deals.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="w-5 h-5 rounded-md hover:bg-[var(--background-secondary)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
                aria-label="Next deal"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              onClose?.();
            }}
            className="w-5 h-5 rounded-md hover:bg-[var(--background-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center"
            aria-label="Dismiss deal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="text-left space-y-0.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
          {currentDeal.title}
        </h4>
        <p className="text-[11px] font-semibold text-[var(--text-secondary)] truncate">
          {currentDeal.storeName}
        </p>
        <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-1">
          {currentDeal.discountSummary}
        </p>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[11px]">
        {currentDeal.expiresInHours ? (
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Ends in {currentDeal.expiresInHours}h
          </span>
        ) : (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            In-store pickup
          </span>
        )}

        <span className="font-bold text-[var(--brand-core)] flex items-center gap-1 hover:underline">
          View Store & Offer <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
