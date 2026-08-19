"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface PromotionDealItem {
  id: string;
  storeId: string;
  storeName: string;
  logoUrl?: string | null;
  title: string;
  badgeLabel: string;
  discountSummary: string;
  distanceKm: number;
  expiresInHours?: number;
  category?: string;
  isSponsored?: boolean;
}

interface PromotionsNearYouCarouselProps {
  deals?: PromotionDealItem[];
  onSelectDeal?: (deal: PromotionDealItem) => void;
  className?: string;
}

const DEFAULT_DEALS: PromotionDealItem[] = [
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
  {
    id: "deal-3",
    storeId: "store-organics",
    storeName: "Cordillera Organic Market",
    title: "₱50 OFF Fresh Strawberry Crates",
    badgeLabel: "₱50 OFF",
    discountSummary: "Direct farm harvest with in-store pickup",
    distanceKm: 1.5,
    expiresInHours: 12,
    category: "Fresh Produce",
    isSponsored: false,
  },
  {
    id: "deal-4",
    storeId: "store-artisan",
    storeName: "Ili-Likha Artisan Crafts",
    title: "15% OFF Handwoven Textiles",
    badgeLabel: "15% OFF",
    discountSummary: "Traditional Cordilleran weave patterns",
    distanceKm: 2.1,
    expiresInHours: 24,
    category: "Handicrafts",
    isSponsored: false,
  },
];

export function PromotionsNearYouCarousel({
  deals = DEFAULT_DEALS,
  onSelectDeal,
  className = "",
}: PromotionsNearYouCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!deals || deals.length === 0) return null;

  return (
    <div className={`space-y-3 text-left ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Promotions Near You</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Live Deals
              </span>
            </h3>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-lg border bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)] text-[var(--text-secondary)] flex items-center justify-center transition-colors shadow-sm"
            style={{ borderColor: "var(--border-light)" }}
            aria-label="Previous deals"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-lg border bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)] text-[var(--text-secondary)] flex items-center justify-center transition-colors shadow-sm"
            style={{ borderColor: "var(--border-light)" }}
            aria-label="Next deals"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Deal Rail */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        {deals.map((deal) => (
          <div
            key={deal.id}
            onClick={() => onSelectDeal?.(deal)}
            className="min-w-[270px] sm:min-w-[300px] max-w-[320px] rounded-2xl bg-[var(--background-elevated)] border hover:border-[var(--brand-core)] hover:shadow-lg transition-all p-3.5 flex flex-col justify-between space-y-3 cursor-pointer group snap-start relative overflow-hidden"
            style={{ borderColor: "var(--border-light)" }}
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {deal.badgeLabel}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                <MapPin className="w-3 h-3 text-[var(--brand-core)]" />
                <span>
                  {deal.distanceKm < 1
                    ? `${Math.round(deal.distanceKm * 1000)}m away`
                    : `${deal.distanceKm}km away`}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-core)] transition-colors line-clamp-1">
                {deal.title}
              </h4>
              <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                {deal.storeName}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-2">
                {deal.discountSummary}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[11px]">
              {deal.expiresInHours ? (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Ends in {deal.expiresInHours}h
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active today
                </span>
              )}

              <span className="font-bold text-[var(--brand-core)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View Offer <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Sponsored Indicator */}
            {deal.isSponsored && (
              <span className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold bg-[var(--background-secondary)] text-[var(--text-tertiary)] border-b border-l border-[var(--border-light)]">
                Promoted
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
