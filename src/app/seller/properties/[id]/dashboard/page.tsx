"use client";

import { use } from "react";
import Link from "next/link";
import { usePropertyDashboard } from "@/features/properties/hooks/usePropertyDashboard";
import { ApiError } from "@/shared/errors/api-error";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  HomeIcon,
  LandPlotIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "lucide-react";

interface PropertyDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDashboardPage({
  params,
}: PropertyDashboardPageProps) {
  const { id } = use(params);
  const propertyQuery = usePropertyDashboard(id);

  if (propertyQuery.isLoading) {
    return (
      <div className="p-8 text-sm text-[var(--text-secondary)]">
        Loading property dashboard…
      </div>
    );
  }

  if (propertyQuery.isError) {
    const error = propertyQuery.error;
    const message =
      error instanceof ApiError && error.status === 403
        ? "This property is not verified or you do not have access."
        : error.message || "We could not load this property.";

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

  const property = propertyQuery.data;
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
          <ShieldCheckIcon className="h-4 w-4" /> Verified
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
              {isHouseLot ? (
                <HomeIcon className="h-5 w-5" />
              ) : (
                <LandPlotIcon className="h-5 w-5" />
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
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
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
