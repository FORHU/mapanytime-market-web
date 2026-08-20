"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MapPin, X, Plus, Star, SaveIcon, ImagePlus } from "lucide-react";
import {
  useStoreProfiles,
  useStoreCategories,
  useUpdateStoreProfile,
} from "../hooks/useStoreProfile";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import type { UpdateStoreProfileInput } from "../contracts/store-profile.contract";

interface StoreProfileSettingsProps {
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

export function StoreProfileSettings({
  activeStoreId,
  isHydrated = true,
}: StoreProfileSettingsProps) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

  const [closedDays, setClosedDays] = useState<Record<string, boolean>>({
    Sunday: true,
  });

  /**
   * `null` means "untouched, follow the store". useState only reads its
   * initialiser on first render, and on that render `stores` is still loading
   * so `store` is undefined — seeding straight from `store.isActive` would
   * therefore pin the toggle to the fallback `true` forever, and saving an
   * inactive store would silently reactivate it.
   */
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const isOpenToCustomers = openOverride ?? store?.isActive ?? true;

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerUpload = useS3AssetUpload("stores");

  const { mutate: saveProfile, isPending: isSubmitting } =
    useUpdateStoreProfile({
      onSuccess: () => {
        toast.success("Store profile saved");
        setBannerFile(null);
        setBannerPreview(null);
      },
    });

  const handleClosedToggle = (day: string) => {
    setClosedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  /**
   * The fields are uncontrolled (`defaultValue`, no onChange), so the current
   * values are read off the form at submit rather than mirrored into state.
   * `isActive` is the one exception — it is a custom toggle button, not a form
   * control, so it comes from the `isOpenToCustomers` toggle.
   *
   * Weekly hours and subcategories are intentionally absent: hours need a
   * separate endpoint shape (StoreHours rows, minutes since midnight) and the
   * subcategory chips are still hardcoded markup. Sending them as-is would
   * persist placeholder data. See docs/connection-audit.md §1.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!store) return;

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();

    const input: UpdateStoreProfileInput = {
      storeName: text("storeName"),
      description: text("description"),
      phone: text("phone"),
      email: text("email"),
      currentAddress: text("currentAddress"),
      city: text("city"),
      province: text("province"),
      postalCode: text("postalCode"),
      country: text("country"),
      isActive: isOpenToCustomers,
    };

    // An unset <select> submits "", which would fail the API's string check.
    const categoryId = text("categoryId");
    if (categoryId) input.categoryId = categoryId;

    if (bannerFile) {
      try {
        const result = await bannerUpload.mutateAsync(bannerFile);
        if (result.fileId) input.bannerId = result.fileId;
      } catch {
        return; // useS3AssetUpload already surfaced a toast.
      }
    }

    saveProfile({ storeId: store.id, input });
  };

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
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--background-primary)] rounded-xl border border-[var(--border-light)] shadow-sm w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Store profile
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage how your store appears to customers
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || bannerUpload.isPending}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "var(--brand-core)",
            color: "var(--background-primary)",
          }}
        >
          <SaveIcon className="h-4 w-4" />
          {bannerUpload.isPending
            ? "Uploading photo…"
            : isSubmitting
              ? "Saving…"
              : "Save Profile"}
        </button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)]">
                {bannerPreview || store.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote CDN URLs aren't in next.config.ts's image remotePatterns
                  <img
                    src={bannerPreview || store.bannerUrl || undefined}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--text-quaternary)]">
                    <ImagePlus size={20} />
                  </div>
                )}
              </div>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--background-secondary)]">
                  {bannerUpload.isPending ? "Uploading…" : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                    disabled={bannerUpload.isPending}
                  />
                </label>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Shown on your store&apos;s map marker. JPG or PNG.
                </p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Store name{" "}
                <span className="text-[var(--md-sys-color-error)]">*</span>
              </label>
              <input
                type="text"
                name="storeName"
                defaultValue={store.storeName || ""}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                About
              </label>
              <textarea
                rows={2}
                name="description"
                defaultValue={store.description || ""}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={store.phone ? String(store.phone) : ""}
                placeholder="No phone number"
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={store.email || ""}
                placeholder="No email address"
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Primary category
              </label>
              <select
                name="categoryId"
                defaultValue={store.primaryCategoryId || store.categoryId || ""}
                disabled={categoriesLoading || Boolean(categoriesError)}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)] disabled:opacity-50"
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? "Loading categories..."
                    : categoriesError
                      ? "Unable to load categories"
                      : "Select a category"}
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <p className="mt-1 text-xs text-rose-500">
                  Could not load categories.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Subcategories
              </label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-sm font-medium rounded-full">
                  Smartphones
                  <button
                    type="button"
                    className="text-[var(--brand-core)] hover:text-[var(--md-sys-color-on-primary-container)] focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] text-sm font-medium rounded-full transition-colors focus:outline-none"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Address
              </label>
              <input
                type="text"
                name="currentAddress"
                defaultValue={location?.currentAddress || ""}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                defaultValue={location?.city || ""}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Province/State
              </label>
              <input
                type="text"
                name="province"
                defaultValue={location?.province || ""}
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                ZIP code
              </label>
              <input
                type="text"
                name="postalCode"
                defaultValue={
                  location?.postalCode ? String(location.postalCode) : ""
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                defaultValue={location?.country || "Philippines"}
                className="w-full md:w-1/3 px-3 py-2 border border-[var(--border-default)] bg-[var(--background-elevated)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
              />
            </div>

            <div className="col-span-1 md:col-span-3 mt-2">
              <div className="h-[120px] w-full bg-[var(--background-secondary)] border border-[var(--border-default)] rounded-lg flex flex-col items-center justify-center text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--border-light)] transition-colors">
                <MapPin
                  size={24}
                  className="mb-2 text-[var(--text-quaternary)]"
                />
                <span className="text-sm font-medium">Map pin selector</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-4">
              Weekly hours
            </label>
            <div className="border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--background-elevated)]">
              {daysOfWeek.map((day) => {
                const isClosed = closedDays[day] || false;
                return (
                  <div
                    key={day}
                    className="flex flex-col sm:flex-row sm:items-center py-3 px-4 border-b border-[var(--border-light)] last:border-0 gap-4 sm:gap-0"
                  >
                    <div className="w-32 text-sm font-medium text-[var(--text-primary)]">
                      {day}
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <input
                        type="time"
                        defaultValue="09:00"
                        disabled={isClosed}
                        className="px-3 py-1.5 border border-[var(--border-default)] bg-transparent rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)] disabled:opacity-50"
                      />
                      <span className="text-[var(--text-secondary)] text-sm">
                        to
                      </span>
                      <input
                        type="time"
                        defaultValue="17:00"
                        disabled={isClosed}
                        className="px-3 py-1.5 border border-[var(--border-default)] bg-transparent rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)] disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`closed-${day}`}
                        checked={isClosed}
                        onChange={() => handleClosedToggle(day)}
                        className="h-4 w-4 text-[var(--brand-core)] border-[var(--border-default)] rounded focus:ring-[var(--brand-core)] cursor-pointer"
                      />
                      <label
                        htmlFor={`closed-${day}`}
                        className="text-sm text-[var(--text-secondary)] cursor-pointer select-none"
                      >
                        Closed
                      </label>
                    </div>
                  </div>
                );
              })}
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
              Control visibility and see your standing
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            {/* Toggle 1 */}
            <div className="bg-[var(--background-secondary)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Open to customers
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your storefront is visible in search
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isOpenToCustomers}
                onClick={() => setOpenOverride(!isOpenToCustomers)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)] focus:ring-offset-2 ${
                  isOpenToCustomers
                    ? "bg-[var(--brand-core)]"
                    : "bg-[var(--border-strong)]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[var(--md-sys-color-on-primary)] transition-transform ${
                    isOpenToCustomers ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Read-only Card */}
          <div className="border border-[var(--border-default)] rounded-xl p-6 bg-[var(--background-elevated)]">
            <div className="mb-4">
              {store.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                  Approved & Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Hidden
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Store ID
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)] font-mono">
                  {store.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Opened Date
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  {formatDate(store.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Rating
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)] flex items-center gap-1">
                  4.9{" "}
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                  Followers
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">0</dd>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
