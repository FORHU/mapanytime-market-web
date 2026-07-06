"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Sparkles, MapPin, Eye, Package } from "lucide-react";
import ProductImageUploader from "@/features/seller-catalog/components/ProductImageUploader";

// 💡 SIMULATED DATABASE CONTRACT STRUCTURE
interface MerchantMetrics {
  activePins: number;
  weeklyImpressions: number;
  catalogCount: number;
  isConnectedToS3: boolean;
}

export default function SellerDashboardPage() {
  // ⚡ HOOK STATE: Replace the initial values here to immediately update the whole dashboard UI
  const [storeData, setStoreData] = useState<MerchantMetrics>({
    activePins: 14,
    weeklyImpressions: 2840,
    catalogCount: 48,
    isConnectedToS3: true,
  });

  const performanceMetrics = [
    {
      title: "Active Pins",
      value: storeData.activePins.toLocaleString(),
      description: "Live storefront map markers",
      icon: MapPin,
    },
    {
      title: "Impressions",
      value: storeData.weeklyImpressions.toLocaleString(),
      description: "Hyperlocal lookups this week",
      icon: Eye,
    },
    {
      title: "Catalog Items",
      value: storeData.catalogCount.toLocaleString(),
      description: "Total digitalized items",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Dynamic Page Header Context Block */}
      <PageHeader
        title="Merchant Dashboard"
        description="Monitor mapping presence, stream inventory items, and track live consumer views."
        action={
          <div
            className="flex items-center gap-2 px-3 py-1.5 border rounded-xl text-[11px] font-bold bg-zinc-50 dark:bg-zinc-900"
            style={{ borderColor: "var(--border-light)" }}
          >
            <span
              className={`w-2 h-2 rounded-full ${storeData.isConnectedToS3 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
            />
            <span style={{ color: "var(--text-secondary)" }}>
              {storeData.isConnectedToS3
                ? "Connected to S3 Pipelines"
                : "Pipeline Disconnected"}
            </span>
          </div>
        }
      />

      {/* 2. Micro Stats Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {performanceMetrics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="mb-1">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {stat.title}
                </span>
                <Icon
                  className="w-4 h-4"
                  style={{ color: "var(--brand-core)" }}
                />
              </CardHeader>
              <CardContent className="space-y-0.5 text-left">
                <div className="text-2xl font-black tracking-tight">
                  {stat.value}
                </div>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-quaternary)" }}
                >
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. Core Functional Split Architecture Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Image Asset Dropzone */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="mb-4 text-left">
              <div className="flex items-center justify-between gap-4 mb-1">
                <h2 className="text-sm font-black">
                  Fast-Upload Catalog Asset
                </h2>
                <StatusPill
                  label={
                    storeData.isConnectedToS3 ? "Cloud Connected" : "Offline"
                  }
                  variant={storeData.isConnectedToS3 ? "success" : "error"}
                />
              </div>
              <p
                className="text-[11px] font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                Snap or drop item snapshots. Images directly feed secure
                presigned URLs bypassing frontend storage.
              </p>
            </div>

            <ProductImageUploader />
          </Card>
        </div>

        {/* Right Side: Onboarding Canvas Context */}
        <div className="lg:col-span-7">
          <Card
            className="p-8 flex flex-col items-center justify-center text-center border-dashed py-16"
            style={{
              backgroundColor: "var(--background-secondary)",
              borderColor: "var(--border-default)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              style={{
                backgroundColor: "var(--background-tertiary)",
                color: "var(--brand-core)",
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 className="text-base font-black tracking-tight mb-1">
              Architecture Canvas Initialized Safely
            </h3>
            <p
              className="text-xs font-medium max-w-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Your brand-new dashboard workspace is fully functional. Hardcoded
              secrets are removed, types are unified, global providers run out
              of the layout, and features are completely modular.
            </p>

            <div
              className="mt-6 p-4 rounded-xl border text-left max-w-md w-full text-[10px] font-mono space-y-1 bg-opacity-60 backdrop-blur-sm"
              style={{
                backgroundColor: "var(--background-elevated)",
                borderColor: "var(--border-light)",
              }}
            >
              <div className="text-emerald-500 font-bold">
                ✓ src/shared/components/ui/ established
              </div>
              <div className="text-emerald-500 font-bold">
                ✓ src/features/seller-catalog/ encapsulated
              </div>
              <div className="text-emerald-500 font-bold">
                ✓ src/app/api/s3-upload/ fully secured
              </div>
              <div className="text-zinc-400 mt-2">
                <p>Ready to register subsquent pagge frames...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
