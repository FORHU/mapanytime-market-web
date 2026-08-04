"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { useStores } from "@/features/stores/hooks/useStores";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { Store, MapPin, Calendar, ShieldCheck, ShieldOff } from "lucide-react";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export default function StoreProfilePage() {
  const { activeStoreId, isHydrated } = useActiveStore();
  const { data: stores, isLoading, isError, error } = useStores();

  const store = stores?.find((s) => s.id === activeStoreId);

  const location = store?.storeLocations;
  const address = [
    location?.currentAddress,
    location?.city,
    location?.province,
    location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pt-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Store details
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          How your store appears to customers on the map.
        </p>
      </div>

      {!isHydrated || isLoading ? (
        <Card className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
          Loading your store…
        </Card>
      ) : isError ? (
        <Card className="p-6 border-rose-200 bg-rose-50/20 text-sm text-rose-600 dark:text-rose-400">
          <strong className="font-semibold">
            We couldn&apos;t load your store details.
          </strong>{" "}
          {error?.message}
        </Card>
      ) : !store ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            We couldn&apos;t find the store you&apos;re managing.
          </p>
          <Link
            href="/seller/manage-stores"
            className="text-sm font-medium text-[var(--brand-core)] hover:underline"
          >
            Choose a store
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center text-center justify-center space-y-4 border-[var(--border-default)]">
            <div className="p-4 rounded-2xl bg-[var(--background-tertiary)] text-[var(--brand-core)]">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {store.storeName}
              </h2>
              <p className="text-xs font-mono text-[var(--text-tertiary)] mt-1 break-all">
                {store.id}
              </p>
            </div>
            {store.isActive ? (
              <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Open to customers
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-[var(--background-tertiary)] border border-[var(--border-light)] rounded-full flex items-center gap-1">
                <ShieldOff className="w-3.5 h-3.5" /> Not visible
              </span>
            )}
          </Card>

          <Card className="p-6 md:col-span-2 space-y-4 border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b pb-2 border-[var(--border-light)]">
              Store information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  About this store
                </span>
                <p className="text-[var(--text-primary)]">
                  {store.description || "No description added yet."}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </span>
                <p className="text-[var(--text-primary)]">
                  {address || "No address on file."}
                </p>
              </div>

              <div className="space-y-1 border-t pt-3 sm:col-span-2 border-[var(--border-light)]">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Opened on
                </span>
                <p className="text-[var(--text-secondary)]">
                  {formatDate(store.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
