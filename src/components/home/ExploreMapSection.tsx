"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Store,
  Heart,
  MapPin,
  Tag,
  ShoppingBag,
  X,
  Navigation,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLatestRelease } from "@/features/app-releases/hooks/useLatestRelease";
import { useNearbyStores } from "@/features/stores/hooks/useNearbyStores";
import { useCategories } from "@/features/stores/hooks/useCategories";

const LiveHeroMap = dynamic(() => import("@/components/home/LiveHeroMap"), {
  ssr: false,
});

interface ExploreMapSectionProps {
  mounted: boolean;
  setIsDownloadModalOpen: (open: boolean) => void;
}

export default function ExploreMapSection({
  mounted,
  setIsDownloadModalOpen,
}: ExploreMapSectionProps) {
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const { downloadUrl: apkDownloadUrl } = useLatestRelease();
  const { stores: nearbyStores, loading: storesLoading } = useNearbyStores(3);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <section
      id="map"
      className="scroll-mt-24 pt-6 w-full overflow-hidden bg-background relative z-10 transition-colors"
    >
      <div className="relative w-full h-[550px] xl:h-[650px] overflow-hidden">
        {/* Full-bleed map with fading edges */}
        <div className="absolute inset-0 z-0 bg-background">
          <LiveHeroMap onStoreClick={setSelectedStore} />
          {/* Edge Gradients for soft fading */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-background/0 pointer-events-none z-10"></div>
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-background via-background/90 to-background/0 pointer-events-none z-10"></div>
          <div className="absolute left-0 inset-y-0 w-64 sm:w-[400px] lg:w-[600px] bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 inset-y-0 w-64 sm:w-[400px] lg:w-[600px] bg-gradient-to-l from-background via-background/50 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Floating Panel Container (constrained to 1400px center) */}
        <div className="absolute inset-0 pointer-events-none z-20 max-w-[1400px] mx-auto w-full">
          {/* Floating Panel (Right side) */}
          <div className="absolute top-4 right-4 left-4 sm:left-auto bottom-4 sm:w-[420px] lg:w-[480px] flex flex-col gap-4 bg-surface/90 backdrop-blur-2xl p-5 rounded-[24px] shadow-2xl border border-outline-variant/20 overflow-hidden pointer-events-auto">
            {selectedStore ? (
              // Option 2: Store Inspector
              <div className="flex flex-col flex-1 min-h-0 bg-surface rounded-[24px] border border-outline-variant/20 overflow-hidden shadow-sm animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="relative w-full h-48 sm:h-64 bg-surface-container-low shrink-0">
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="absolute top-4 right-4 z-20 p-2 bg-surface/80 backdrop-blur-md rounded-full text-on-surface hover:bg-surface hover:text-error transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {selectedStore.logoUrl ? (
                    <Image
                      src={selectedStore.logoUrl}
                      alt={selectedStore.storeName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <Store className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>

                  <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end z-10">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          selectedStore.isActive
                            ? "bg-primary text-on-primary"
                            : "bg-surface-variant text-on-surface-variant"
                        }`}
                      >
                        {selectedStore.isActive ? "Open Now" : "Closed"}
                      </span>
                      {selectedStore.categoryName && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white/90 text-on-surface flex items-center gap-1 backdrop-blur-md">
                          {selectedStore.categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 overflow-y-auto min-h-0">
                  <h2
                    className="font-display text-2xl font-extrabold text-on-surface mb-2 leading-snug line-clamp-2"
                    title={selectedStore.storeName}
                  >
                    {selectedStore.storeName}
                  </h2>
                  <div className="flex items-start gap-2 text-on-surface-variant text-[14px] mb-4">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {selectedStore.address?.currentAddress ||
                        "Address not provided"}
                      <br />
                      {selectedStore.address?.city},{" "}
                      {selectedStore.address?.province}
                    </span>
                  </div>

                  <div className="mt-auto pt-6 border-t border-outline-variant/10">
                    <Link
                      href={`/store/${selectedStore.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary font-bold text-[14px] rounded-xl hover:bg-primary-fixed transition-colors shadow-sm"
                    >
                      <Store className="w-4 h-4" /> View Store
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // Option 3: Trending Deals Feed (Default)
              <>
                {/* Header & Typography */}
                <div className="shrink-0">
                  <h2 className="font-display text-[32px] leading-[1.1] font-extrabold text-on-surface tracking-tight mb-2">
                    Trending <span className="text-primary">Deals</span>
                    <br />
                    Nearby
                  </h2>
                  <p className="text-on-surface-variant font-body text-[14px] max-w-[400px]">
                    Discover the hottest items and promotions around your
                    location right now.
                  </p>
                </div>

                {/* Trending Deals Feed */}
                {storesLoading ? (
                  <div className="flex flex-col gap-3 flex-1 min-h-0">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-surface rounded-[16px] border border-outline-variant/10 h-[88px] animate-pulse"
                      />
                    ))}
                  </div>
                ) : nearbyStores.length === 0 ? (
                  <div className="rounded-[24px] border border-outline-variant/20 bg-surface/80 p-8 text-center shrink-0">
                    <ShoppingBag className="w-8 h-8 text-on-surface-variant mx-auto mb-3" />
                    <p className="text-[15px] font-bold text-on-surface mb-1">
                      No deals found near you
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-surface-variant/50 scrollbar-track-transparent flex-1 min-h-0">
                    {nearbyStores.slice(0, 3).map((store, i) => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className="bg-surface rounded-[16px] shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative flex items-center p-3 border border-outline-variant/10 text-left h-[88px]"
                      >
                        <div className="w-[64px] h-[64px] rounded-[12px] relative bg-surface-container-low overflow-hidden shrink-0">
                          {store.logoUrl ? (
                            <Image
                              src={store.logoUrl}
                              alt={store.storeName}
                              fill
                              unoptimized
                              sizes="64px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-orange-50 text-orange-500">
                              <Tag className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="bg-error text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-sm shrink-0">
                              {20 + (i % 3) * 10}% OFF
                            </span>
                            <span className="text-[11px] text-on-surface-variant font-bold truncate">
                              {store.storeName}
                            </span>
                          </div>
                          <h4 className="font-bold text-[14px] text-on-surface leading-tight truncate">
                            {
                              [
                                "Fresh Produce Bundle",
                                "Weekend Meat Sale",
                                "Organic Coffee Beans",
                              ][i % 3]
                            }
                          </h4>
                        </div>
                        <ChevronDown className="w-4 h-4 text-on-surface-variant -rotate-90 ml-2 shrink-0 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* App Download Banner */}
            <div className="mt-auto shrink-0 rounded-2xl px-3 py-2.5 flex items-center gap-3 border border-outline-variant/20 relative overflow-hidden bg-surface-container-low shadow-sm">
              {/* Background Gradient */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface to-surface-container-high opacity-50"></div>

              <div className="flex-1 relative z-10">
                <h4 className="font-bold text-[13px] text-on-surface mb-2 leading-tight">
                  Take the Map Anytime with you!
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled
                    className="bg-surface text-on-surface flex items-center gap-1.5 px-2 py-1 rounded-md border border-outline-variant/20 shadow-sm opacity-60 cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      className="w-3 h-3 fill-current"
                    >
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] leading-none">
                        Download on the
                      </span>
                      <span className="text-[10px] font-bold leading-tight flex items-center">
                        App Store{" "}
                        <span className="ml-1 text-[6px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/50 px-1 rounded-full font-bold">
                          Soon
                        </span>
                      </span>
                    </div>
                  </button>
                  <button
                    disabled
                    className="bg-surface text-on-surface flex items-center gap-1.5 px-2 py-1 rounded-md border border-outline-variant/20 shadow-sm opacity-60 cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-3 h-3 fill-current"
                    >
                      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] leading-none">GET IT ON</span>
                      <span className="text-[10px] font-bold leading-tight flex items-center">
                        Google Play{" "}
                        <span className="ml-1 text-[6px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/50 px-1 rounded-full font-bold">
                          Soon
                        </span>
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="bg-primary text-on-primary flex items-center gap-1.5 px-2 py-1 rounded-md shadow-md hover:bg-primary-fixed transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-3 h-3 fill-current group-hover:scale-110 transition-transform"
                    >
                      <path d="M279.1 156.4h-46.2l-21.7-41.9c-2.3-4.4-7.7-6.1-12.1-3.8-4.4 2.3-6.1 7.7-3.8 12.1l22.4 43.1C164.4 186.8 126 242.4 126 308h260c0-65.6-38.4-121.2-91.7-142.1l22.4-43.1c2.3-4.4 .6-9.8-3.8-12.1-4.4-2.3-9.8-.6-12.1 3.8l-21.7 41.9zM192 252c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm128 0c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm-204.6 66h32.2V428c0 17.7 14.3 32 32 32h20c17.7 0 32-14.3 32-32V318h16V428c0 17.7 14.3 32 32 32h20c17.7 0 32-14.3 32-32V318h32.2c17.7 0 32-14.3 32-32V176c0-17.7-14.3-32-32-32H115.4c-17.7 0-32 14.3-32 32V286c0 17.7 14.3 32 32 32z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] leading-none">
                        Download direct
                      </span>
                      <span className="text-[10px] font-bold leading-tight">
                        Android APK
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              {mounted && apkDownloadUrl && (
                <div className="hidden lg:block w-12 h-12 bg-surface p-0.5 rounded-lg shadow-sm border border-outline-variant/20 shrink-0 relative z-10">
                  <div className="w-full h-full rounded-md overflow-hidden flex items-center justify-center bg-white">
                    <QRCodeSVG
                      value={apkDownloadUrl}
                      size={80}
                      level="M"
                      title="Download the MapAnytime Android APK"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Bottom Features Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 mt-10 border-t border-outline-variant/10 w-full pb-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                Find Nearby Stores
              </h4>
              <p className="text-[13px] text-on-surface-variant leading-tight">
                Explore stores and products near your location.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                Real-time Updates
              </h4>
              <p className="text-[13px] text-on-surface-variant leading-tight">
                Live store status and product availability.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                Trusted & Rated
              </h4>
              <p className="text-[13px] text-on-surface-variant leading-tight">
                Top-rated stores you can trust and rely on.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                Pick Up & Save
              </h4>
              <p className="text-[13px] text-on-surface-variant leading-tight">
                Order online and pick up at your convenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
