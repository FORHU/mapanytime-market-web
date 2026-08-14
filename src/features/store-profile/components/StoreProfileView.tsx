"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Pencil, Star, Image as ImageIcon } from "lucide-react";
import { useStoreProfiles, useStoreCategories } from "../hooks/useStoreProfile";

interface StoreProfileViewProps {
  activeStoreId?: string | null;
  isHydrated?: boolean;
}

function formatDate(value?: string | Date) {
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

function ValueCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--text-primary)]">{children}</dd>
    </div>
  );
}

export function StoreProfileView({
  activeStoreId,
  isHydrated = true,
}: StoreProfileViewProps) {
  const {
    data: stores,
    isLoading: storesLoading,
    isError: storesError,
    error: storesErrorDetails,
  } = useStoreProfiles();

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useStoreCategories();

  const store = stores?.find((s) => s.id === activeStoreId);
  const location = store?.storeLocations;
  const categoryName = categories?.find(
    (c) => c.id === store?.categoryId,
  )?.name;

  if (!isHydrated || storesLoading || categoriesLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse text-[var(--text-secondary)]">
        Loading your store profile...
      </div>
    );
  }

  if (storesError || categoriesError) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="p-6 border-rose-200 bg-rose-50/20 text-sm text-rose-600 rounded-lg">
          <strong className="font-semibold">
            We couldn&apos;t load your store details.
          </strong>{" "}
          {storesErrorDetails?.message}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          We couldn&apos;t find the store you&apos;re managing.
        </p>
        <Link
          href="/seller/manage-stores"
          className="text-sm font-medium text-[var(--brand-core)] hover:underline"
        >
          Choose a store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-primary)] w-full max-w-4xl mx-auto rounded-xl border border-[var(--border-light)] shadow-sm overflow-hidden my-4 sm:my-8">
      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Store Profile
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              How your store appears to customers
            </p>
          </div>
          <Link
            href="/seller/store-profile"
            aria-label="Edit store profile"
            title="Edit store profile"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)] focus:ring-offset-2"
            style={{
              background: "var(--brand-core)",
              color: "var(--background-primary)",
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>

        <div className="space-y-8">
          {/* SECTION 1: General */}
          <section className="pb-8 border-b border-[var(--border-light)]">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">
                General
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Basic details customers see first
              </p>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <ValueCell label="Store name">
                  {store.storeName || "—"}
                </ValueCell>
              </div>
              <div className="col-span-1 md:col-span-2">
                <ValueCell label="About">
                  {store.description || "No description yet"}
                </ValueCell>
              </div>
              <ValueCell label="Phone">
                {store.phone ? String(store.phone) : "No phone number"}
              </ValueCell>
              <ValueCell label="Email">
                {store.email || "No email address"}
              </ValueCell>
              <ValueCell label="Primary category">
                {categoryName || store.categoryId || "No category selected"}
              </ValueCell>
            </dl>
          </section>

          {/* SECTION 2: Location and hours */}
          <section className="pb-8 border-b border-[var(--border-light)]">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">
                Location and hours
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Where customers find you and when you are open
              </p>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <ValueCell label="Address">
                  {location?.currentAddress || "No address set"}
                </ValueCell>
              </div>
              <ValueCell label="City">{location?.city || "—"}</ValueCell>
              <ValueCell label="Province/State">
                {location?.province || "—"}
              </ValueCell>
              <ValueCell label="ZIP code">
                {location?.postalCode ? String(location.postalCode) : "—"}
              </ValueCell>
              <ValueCell label="Country">
                {location?.country || "Philippines"}
              </ValueCell>
            </dl>

            <div className="mt-6">
              <div className="h-[120px] w-full bg-[var(--background-secondary)] border border-[var(--border-default)] rounded-lg flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <MapPin
                  size={24}
                  className="mb-2 text-[var(--text-quaternary)]"
                />
                <span className="text-sm font-medium">Map pin location</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: Status */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">
                Status
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Your store&apos;s visibility and standing
              </p>
            </div>

            <div className="border border-[var(--border-default)] rounded-xl p-6 bg-[var(--background-elevated)]">
              <div className="mb-4">
                {store.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                    Approved &amp; Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    Hidden
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ValueCell label="Store ID">
                  <span className="font-mono">{store.id}</span>
                </ValueCell>
                <ValueCell label="Opened Date">
                  {formatDate(store.createdAt)}
                </ValueCell>
                <ValueCell label="Rating">
                  <span className="flex items-center gap-1">
                    4.9{" "}
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                  </span>
                </ValueCell>
                <ValueCell label="Followers">0</ValueCell>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
