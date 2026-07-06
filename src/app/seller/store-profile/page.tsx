"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Store, MapPin } from "lucide-react";

export default function StoreProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Profile Canvas"
        description="Refine your digital storefront footprint, update geographic tracking data, and adjust open hours."
      />

      <Card>
        <CardContent className="p-12 text-center py-16">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <Store className="w-5 h-5" />
          </div>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Your storefront data is actively synced with global consumer maps.
            Location tracking pins are verified.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
