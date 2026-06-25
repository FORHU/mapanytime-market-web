"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ClipboardList,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ManagedStore {
  id: string;
  name: string;
  location: string;
  activeOrders: number;
}

export default function ManagedStoresPage() {
  // Input tracking state (binds instantly to what the user keys in)
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search state (waits for typing to pause before changing)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // Minor helper state to show a tiny loading spinner during the wait window
  const [isSearching, setIsSearching] = useState(false);

  // Core business branch profile matrix data collection
  const stores: ManagedStore[] = [
    {
      id: "STORE-9921",
      name: "Lola Joe's Restaurant",
      location: "Session Road, Baguio",
      activeOrders: 5,
    },
    {
      id: "STORE-4401",
      name: "Sea Waves Chalet Beach Resort",
      location: "Bauang, La Union",
      activeOrders: 2,
    },
    {
      id: "STORE-1120",
      name: "Cordillera Sentinel Tech Shop",
      location: "Itogon, Benguet",
      activeOrders: 0,
    },
    {
      id: "STORE-8873",
      name: "Downtown Grocers",
      location: "Harrison Road, Baguio",
      activeOrders: 12,
    },
  ];

  // ── ⏱️ THE SEARCH DEBOUNCE EFFECT PIPELINE ──
  useEffect(() => {
    // If the input isn't blank, show a slight visual typing hint
    if (searchQuery) setIsSearching(true);

    // Set up a 300ms timer window before updating our filter criteria state
    const debounceTimer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    // Clear the active timeout context automatically if the user keys in another character before 300ms
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Execute filtering checks exclusively against the debounced query result
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Welcome Greeting Layout Section Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Managed Stores
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Select a business branch profile below to manage its specific product
          inventory stock.
        </p>
      </div>

      {/* Optimized Filter Search Input Container Block */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Filter Stores
          </label>
          {isSearching && (
            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Indexing list
              fields...
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by store title or municipal location..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            suppressHydrationWarning // 👈 Injected here to suppress Edge extension mismatches smoothly
          />
        </div>
      </div>

      {/* Responsive Grid Layout View */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center text-[9px] font-black tracking-mono font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {store.id}
              </span>

              <div className="space-y-1.5">
                <h3 className="text-md font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                  {store.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500/80 fill-rose-500/10" />
                  {store.location}
                </p>
              </div>
            </div>

            {/* Actions Execution Footer Layer Links */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                Active Orders:{" "}
                <span className="font-black text-slate-800">
                  {store.activeOrders}
                </span>
              </span>

              <Link
                href={`/seller/store/${store.id}/dashboard`}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                Manage Stock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {/* Empty Fallback State Grid Banner */}
        {filteredStores.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs font-bold text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl italic">
            No business branch locations matched your active search string query
            Criteria.
          </div>
        )}
      </div>
    </div>
  );
}
