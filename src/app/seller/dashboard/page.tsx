"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { SellerOrdersBoard } from "@/features/orders/components/SellerOrdersBoard";
import { useStoreOverviewStats } from "@/shared/hooks/useOrdersPipeline";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { usePropertyDashboard } from "@/features/properties/hooks/usePropertyDashboard";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { StoreSelectorDropdown } from "@/features/stores/components/StoreSelectorDropdown";
import { NeedsAttentionCard } from "@/features/dashboard/components/NeedsAttentionCard";
import { SalesOverviewCard } from "@/features/dashboard/components/SalesOverviewCard";
import { StorePerformanceCard } from "@/features/dashboard/components/StorePerformanceCard";
import { ApiError } from "@/shared/errors/api-error";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  PackageCheck,
  AlertTriangle,
  Sparkles,
  Home,
  LandPlot,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function SellerDashboard() {
  const { userId, isHydrated } = useCurrentUser();
  const { activeStoreId } = useActiveStore();
  const { data: stores } = useStoreProfiles();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [storedPropertyId, setStoredPropertyId] = useState<string | null>(null);
  const [propertyContextHydrated, setPropertyContextHydrated] = useState(false);

  const queryContext = searchParams.get("context");
  const queryStoreId = searchParams.get("storeId");
  const queryPropertyId = searchParams.get("propertyId");

  useEffect(() => {
    setStoredPropertyId(localStorage.getItem("active_property_context_id"));
    setPropertyContextHydrated(true);
  }, []);

  const propertyId = queryPropertyId ?? storedPropertyId;
  const isPropertyContext =
    queryContext === "property" || Boolean(propertyId && !activeStoreId);
  const effectivePropertyId = isPropertyContext ? propertyId : null;
  const effectiveStoreId = isPropertyContext
    ? null
    : (queryStoreId ?? activeStoreId);
  const activeStore = stores?.find((s) => s.id === effectiveStoreId);
  const isStoreContext = !isPropertyContext;
  const isContextReady = isHydrated && propertyContextHydrated;

  const propertyQuery = usePropertyDashboard(effectivePropertyId ?? "");

  // Dashboard metrics pre-aggregated from the backend
  const { totalRevenue, statusCounts, lowStockCount, isLoading } =
    useStoreOverviewStats({ userId, storeId: effectiveStoreId });

  const statsReady = isHydrated && isStoreContext && !isLoading;

  if (!isContextReady || (!isPropertyContext && !isStoreContext)) {
    return null;
  }

  if (isPropertyContext) {
    return <PropertyDashboardContent query={propertyQuery} />;
  }

  const headingTitle = activeStore?.storeName
    ? `${activeStore.storeName} Overview`
    : "All Stores Overview";
  const headingDescription = activeStore?.storeName
    ? `Sales, orders, and inventory for ${activeStore.storeName}.`
    : "Aggregated sales, orders, and inventory across all your stores.";

  const pendingOrdersCount =
    (statusCounts?.PENDING ?? 0) + (statusCounts?.PROCESSING ?? 0);
  const readyForPickupCount = statusCounts?.READY_FOR_PICKUP ?? 0;
  const totalOrdersCount = statusCounts?.ALL ?? 0;

  // New Recommended KPI Cards
  const kpiCards = [
    {
      label: "TODAY'S SALES",
      value: `₱${(totalRevenue || 0).toLocaleString()}`,
      hint: "↑ 12.4% vs yesterday",
      hintClass: "text-emerald-600 dark:text-emerald-400 font-medium",
      icon: TrendingUp,
      accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      valueClass: "text-[var(--text-primary)]",
      ready: statsReady,
    },
    {
      label: "ORDERS TO HANDLE",
      value: String(pendingOrdersCount),
      hint: "Waiting on you",
      hintClass: "text-[var(--text-secondary)]",
      icon: ShoppingBag,
      accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      valueClass:
        pendingOrdersCount > 0
          ? "text-amber-600 dark:text-amber-400"
          : "text-[var(--text-primary)]",
      ready: statsReady,
    },
    {
      label: "READY FOR PICKUP",
      value: String(readyForPickupCount),
      hint: "Awaiting customer pickup",
      hintClass: "text-[var(--text-secondary)]",
      icon: PackageCheck,
      accent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      valueClass:
        readyForPickupCount > 0
          ? "text-blue-600 dark:text-blue-400"
          : "text-[var(--text-primary)]",
      ready: statsReady,
    },
    {
      label: "LOW STOCK",
      value: String(lowStockCount || 0),
      hint: "10 or fewer units",
      hintClass: "text-[var(--text-secondary)]",
      icon: AlertTriangle,
      accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      valueClass:
        (lowStockCount || 0) > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-[var(--text-primary)]",
      ready: statsReady,
    },
  ];

  return (
    <div className="space-y-6 w-full text-left">
      {/* ── Top Header and Action Buttons ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <StoreSelectorDropdown />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {headingTitle}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {headingDescription}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/seller/products">
            <Button
              variant="secondary"
              className="!text-xs !px-3.5 !py-2 border shadow-sm"
            >
              <Package className="w-3.5 h-3.5 mr-1.5" /> Manage products
            </Button>
          </Link>
          <Link href="/seller/ai-upload">
            <Button
              variant="secondary"
              className="!text-xs !px-3.5 !py-2 border text-[var(--brand-core)] border-[var(--brand-core)]/30 hover:bg-[var(--brand-core)]/5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[var(--brand-core)]" />{" "}
              Import with AI
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 1. KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(
          ({
            label,
            value,
            hint,
            hintClass,
            icon: Icon,
            accent,
            valueClass,
            ready,
          }) => (
            <Card
              key={label}
              className="p-4 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                {ready ? (
                  <span className={`text-2xl font-bold ${valueClass}`}>
                    {value}
                  </span>
                ) : (
                  <span className="block h-8 w-20 rounded-md bg-[var(--background-tertiary)] animate-pulse" />
                )}
                <span className={`text-xs block mt-0.5 ${hintClass}`}>
                  {hint}
                </span>
              </div>
            </Card>
          ),
        )}
      </div>

      {/* ── 2. Needs Attention Section ────────────────────────────────── */}
      <NeedsAttentionCard
        pendingOrdersCount={pendingOrdersCount}
        readyForPickupCount={readyForPickupCount}
        lowStockCount={lowStockCount || 0}
        isLoading={!statsReady}
      />

      {/* ── 3 & 4. Sales Overview & Store Performance ─────────────────── */}
      <div
        className={`grid gap-5 items-stretch ${
          !activeStoreId ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
        }`}
      >
        <div className={!activeStoreId ? "lg:col-span-2" : "col-span-1"}>
          <SalesOverviewCard
            totalRevenue={totalRevenue || 0}
            totalOrdersCount={totalOrdersCount}
          />
        </div>

        {!activeStoreId && (
          <div className="lg:col-span-1">
            <StorePerformanceCard
              totalRevenue={totalRevenue || 0}
              totalOrdersCount={totalOrdersCount}
            />
          </div>
        )}
      </div>

      {/* ── 5. Recent Orders ─────────────────────────────────────────── */}
      <div className="pt-2">
        <SellerOrdersBoard variant="recent" />
      </div>
    </div>
  );
}

function PropertyDashboardContent({
  query,
}: {
  query: ReturnType<typeof usePropertyDashboard>;
}) {
  if (query.isLoading) {
    return (
      <div className="p-8 text-sm text-[var(--text-secondary)]">
        Loading property dashboard…
      </div>
    );
  }

  if (query.isError) {
    const message =
      query.error instanceof ApiError && query.error.status === 403
        ? "This property is not verified or you do not have access."
        : query.error.message || "We could not load this property.";

    return (
      <div className="max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Property dashboard unavailable
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <Link href="/seller/manage-stores">
          <Button variant="secondary">Back to properties</Button>
        </Link>
      </div>
    );
  }

  const property = query.data;
  if (!property) return null;

  const isHouseLot = property.propertyType === "HOUSE_LOT";
  const propertyLabel = isHouseLot ? "House & Lot" : "Lot";

  return (
    <div className="w-full space-y-8 text-left">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {propertyLabel} dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your verified property listing and activity.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-bold text-emerald-500">
          <ShieldCheck className="h-4 w-4" /> Verified
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
              {isHouseLot ? (
                <Home className="h-5 w-5" />
              ) : (
                <LandPlot className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                Property overview
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {property.legalName}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {property.address}
              {property.subdivision ? `, ${property.subdivision}` : ""}
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Property type
          </p>
          <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
            {propertyLabel}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Status: {property.status}
          </p>
        </Card>
      </div>
    </div>
  );
}
