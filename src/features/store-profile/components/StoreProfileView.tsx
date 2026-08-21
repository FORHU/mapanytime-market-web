"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Pencil, Star } from "lucide-react";
import { useStoreProfiles, useStoreCategories } from "../hooks/useStoreProfile";
import { Card } from "@/shared/components/ui/Card";

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

function ValueBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="px-3.5 py-3 bg-[var(--background-secondary)] border border-[var(--border-light)] rounded-lg text-sm font-medium text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
        {title}
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

const storeHours = [
  { label: "Mon – Fri", value: "9:00 AM – 7:00 PM" },
  { label: "Saturday", value: "10:00 AM – 6:00 PM" },
  { label: "Sunday", value: "Closed" },
];

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
  const categoryName =
    store?.primaryCategory?.name ||
    categories?.find((c) => c.id === store?.primaryCategoryId)?.name;

  if (!isHydrated || storesLoading || categoriesLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse text-[var(--text-secondary)]">
        Loading your store profile...
      </div>
    );
  }

  if (storesError || categoriesError) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
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
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
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
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="text-xs font-extrabold tracking-[0.14em] text-[var(--brand-core)] mb-2">
            STORE PROFILE
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            How your store appears to customers
          </p>
        </div>
        <Link
          href="/seller/store-profile"
          aria-label="Edit store profile"
          title="Edit store profile"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)] focus:ring-offset-2"
          style={{
            background: "var(--text-primary)",
            color: "var(--background-primary)",
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* SECTION 1: General */}
        <Card className="p-8 rounded-2xl">
          <SectionHeader
            title="General"
            description="Basic details customers see first"
          />

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValueBox label="Store name" className="col-span-1 md:col-span-2">
              {store.storeName || "—"}
            </ValueBox>
            <ValueBox label="About" className="col-span-1 md:col-span-2">
              {store.description || "No description yet"}
            </ValueBox>
            <ValueBox label="Phone">
              {store.phone ? String(store.phone) : "No phone number"}
            </ValueBox>
            <ValueBox label="Email">
              {store.email || "No email address"}
            </ValueBox>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                Category
              </div>
              <span
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: "var(--brand-light)",
                  color: "var(--brand-burgundy)",
                }}
              >
                {categoryName ||
                  store?.primaryCategoryId ||
                  "No category selected"}
              </span>
            </div>
          </dl>
        </Card>

        {/* SECTION 2: Location and Hours */}
        <Card className="p-8 rounded-2xl">
          <SectionHeader
            title="Location and Hours"
            description="Where customers find you and when you are open"
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 content-start">
              <ValueBox label="Address" className="col-span-1 sm:col-span-2">
                {location?.currentAddress || "No address set"}
              </ValueBox>
              <ValueBox label="City">{location?.city || "—"}</ValueBox>
              <ValueBox label="Province/State">
                {location?.province || "—"}
              </ValueBox>
              <ValueBox label="ZIP code">
                {location?.postalCode ? String(location.postalCode) : "—"}
              </ValueBox>
              <ValueBox label="Country">
                {location?.country || "Philippines"}
              </ValueBox>
            </dl>

            <div className="relative rounded-2xl overflow-hidden min-h-[220px] border border-[var(--border-default)] bg-[var(--background-secondary)] flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <MapPin size={28} className="mb-2 text-[var(--brand-core)]" />
              <span className="text-sm font-medium">Map pin location</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Store hours
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2">
              {storeHours.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm font-medium text-[var(--text-secondary)] py-2 border-b border-[var(--border-light)]"
                >
                  <span>{row.label}</span>
                  <span
                    className={
                      row.value === "Closed"
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-primary)] font-semibold"
                    }
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* SECTION 3: Status */}
        <Card className="p-8 rounded-2xl">
          <SectionHeader
            title="Status"
            description="Your store's visibility and standing"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2.5">
                Store status
              </div>
              {store.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Approved &amp; Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Hidden
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2.5">
                Store ID
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                {store.id}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2.5">
                Opened date
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {formatDate(store.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2.5">
                Rating
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                4.9
                <Star size={15} className="text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2.5">
                Followers
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                0
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
