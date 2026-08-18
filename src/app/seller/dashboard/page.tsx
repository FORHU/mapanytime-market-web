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
import { ApiError } from "@/shared/errors/api-error";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Home,
  LandPlot,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function SellerDashboard() {
  const { userId, isHydrated } = useCurrentUser();
  const { activeStoreId } = useActiveStore();
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
  const isStoreContext = !isPropertyContext; // Treats global as store context
  const isContextReady = isHydrated && propertyContextHydrated;

  const propertyQuery = usePropertyDashboard(effectivePropertyId ?? "");

  // All tile numbers come pre-aggregated from the backend stats endpoint.
  const {
    totalRevenue,
    pendingCount,
    fulfilledCount,
    lowStockCount,
    isLoading,
  } = useStoreOverviewStats({ userId });

  const statsReady = isHydrated && isStoreContext && !isLoading;

  if (!isContextReady || (!isPropertyContext && !isStoreContext)) {
    return null;
  }

  if (isPropertyContext) {
    return <PropertyDashboardContent query={propertyQuery} />;
  }

  const stats = [
    {
      label: "Total sales",
      value: `₱${totalRevenue.toLocaleString()}`,
      hint: "Across all orders",
      icon: TrendingUp,
      accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      valueClass: "text-[var(--text-primary)]",
      ready: statsReady,
    },
    {
      label: "Orders to handle",
      value: String(pendingCount),
      hint: "Waiting on you",
      icon: ShoppingBag,
      accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      valueClass: "text-amber-600 dark:text-amber-400",
      ready: statsReady,
    },
    {
      label: "Completed orders",
      value: String(fulfilledCount),
      hint: "Picked up by customers",
      icon: CheckCircle2,
      accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
      ready: statsReady,
    },
    {
      label: "Low stock",
      value: String(lowStockCount),
      hint: "Products with 10 or fewer left",
      icon: AlertTriangle,
      accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
      ready: statsReady,
    },
  ];

  return (
    <div className="space-y-8 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Your store at a glance
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sales, orders and stock for the store you&apos;re managing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/products">
            <Button variant="secondary" className="!text-sm border">
              <Package className="w-4 h-4" /> Manage products
            </Button>
          </Link>
          <Link href="/seller/ai-upload">
            <Button className="!text-sm bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md">
              <Sparkles className="w-4 h-4" /> AI import
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(
          ({ label, value, hint, icon: Icon, accent, valueClass, ready }) => (
            <Card
              key={label}
              className="p-4 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                {ready ? (
                  <span className={`text-2xl font-semibold ${valueClass}`}>
                    {value}
                  </span>
                ) : (
                  <span className="block h-8 w-20 rounded-md bg-[var(--background-tertiary)] animate-pulse" />
                )}
                <span className="text-xs text-[var(--text-secondary)] block mt-1">
                  {hint}
                </span>
              </div>
            </Card>
          ),
        )}
      </div>

      <SellerOrdersBoard variant="recent" />
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
