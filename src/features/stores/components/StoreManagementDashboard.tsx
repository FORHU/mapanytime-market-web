"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { Store, Plus, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

interface StoreItem {
  id: string;
  storeName: string;
  isActive: boolean;
  city?: string;
  province?: string;
}

interface StoreManagementDashboardProps {
  stores: StoreItem[];
  onSelectStore: (storeId: string) => void;
  onCreateNewStore: () => void;
}

export default function StoreManagementDashboard({
  stores,
  onSelectStore,
  onCreateNewStore,
}: StoreManagementDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div>
          <h1 className="text-xl font-black tracking-tight text-text-primary">
            Manage Your Storefronts
          </h1>
          <p className="text-xs text-zinc-400">
            Select a secure isolated environment node to manage inventory,
            tracking pins, and S3 upload parameters.
          </p>
        </div>
        <button
          onClick={onCreateNewStore}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New Business
        </button>
      </div>

      {stores.length === 0 ? (
        <Card className="p-12 text-center py-20 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black mb-1">
            No Operational Stores Registered
          </h2>
          <p className="text-xs max-w-sm mx-auto text-zinc-400 mb-6">
            You currently have no active commerce branches mapped. Initialize a
            business profile vector to access your merchant workspace.
          </p>
          <button
            onClick={onCreateNewStore}
            className="px-4 py-2 text-xs font-bold rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
            style={{ borderColor: "var(--border-light)" }}
          >
            Launch First Onboarding Manifest
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="p-5 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group cursor-pointer"
              style={{ borderColor: "var(--border-light)" }}
              onClick={() => onSelectStore(store.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-text-primary group-hover:text-brand-core transition-colors">
                        {store.storeName}
                      </h3>
                    </div>
                  </div>
                  {store.isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 border rounded-md text-emerald-500 bg-emerald-500/5 border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 border rounded-md text-amber-500 bg-amber-500/5 border-amber-500/20 flex items-center gap-1">
                      Pending
                    </span>
                  )}
                </div>

                {(store.city || store.province) && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {[store.city, store.province].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between pt-4 mt-4 border-t text-[11px] font-bold text-zinc-500"
                style={{ borderColor: "var(--border-light)" }}
              >
                <span>Initialize Management Node</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
