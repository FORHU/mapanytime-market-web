"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import {
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Home,
  LandPlot,
} from "lucide-react";
import type { Property } from "@/features/properties/contracts/property.contract";

interface StoreItem {
  id: string;
  storeName: string;
  isActive: boolean;
  city?: string;
  province?: string;
}

interface StoreManagementDashboardProps {
  stores: StoreItem[];
  properties: Property[];
  onSelectStore: (storeId: string) => void;
  onCreateNewStore: () => void;
}

export default function StoreManagementDashboard({
  stores,
  properties,
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

      {stores.length === 0 && properties.length === 0 ? (
        <Card className="p-12 text-center py-20 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black mb-1">
            No Businesses or Properties Registered
          </h2>
          <p className="text-xs max-w-sm mx-auto text-zinc-400 mb-6">
            Initialize a business or property profile to start building your
            marketplace presence.
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
        <div className="space-y-8">
          {stores.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-black text-text-primary">
                  Commerce Stores
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage inventory, orders, and store operations.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {stores.map((store) => (
                  <Card
                    key={store.id}
                    className="group flex cursor-pointer flex-col justify-between p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
                    style={{ borderColor: "var(--border-light)" }}
                    onClick={() => onSelectStore(store.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <Store className="h-4 w-4" />
                          </div>
                          <h3 className="text-sm font-black tracking-tight text-text-primary transition-colors group-hover:text-brand-core">
                            {store.storeName}
                          </h3>
                        </div>
                        {store.isActive ? (
                          <span className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <ShieldCheck className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            Pending
                          </span>
                        )}
                      </div>
                      {(store.city || store.province) && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {[store.city, store.province]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className="mt-4 flex items-center justify-between border-t pt-4 text-[11px] font-bold text-zinc-500"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <span>Initialize Management Node</span>
                      <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {properties.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-black text-text-primary">
                  House &amp; Lot Properties
                </h2>
                <p className="text-xs text-zinc-400">
                  Review your property onboarding drafts and verification
                  status.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {properties.map((property) => {
                  const isHouseLot = property.propertyType === "HOUSE_LOT";

                  return (
                    <Card
                      key={property.id}
                      className="flex flex-col justify-between p-5"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
                              {isHouseLot ? (
                                <Home className="h-4 w-4" />
                              ) : (
                                <LandPlot className="h-4 w-4" />
                              )}
                            </div>
                            <h3 className="text-sm font-black tracking-tight text-text-primary">
                              {isHouseLot ? "House & Lot" : "Raw Land"}
                            </h3>
                          </div>
                          <span className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            Pending
                          </span>
                        </div>
                        <div className="flex items-start gap-1 text-[10px] text-zinc-400">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>
                            {property.address}
                            {property.subdivision
                              ? `, ${property.subdivision}`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div
                        className="mt-4 flex items-center justify-between border-t pt-4 text-[11px] font-bold text-zinc-500"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        <span>Property onboarding draft</span>
                        <span className="text-[10px] font-medium text-zinc-400">
                          Saved for review
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
