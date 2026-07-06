"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { LineChart, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Intelligence"
        description="Monitor user map lookup footprints, storefront views, and geographical traffic conversions."
      />

      <Card>
        <CardContent className="p-12 text-center py-20">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <LineChart className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold mb-1">
            Data Processing In Progress
          </div>
          <p className="text-xs max-w-xs mx-auto text-zinc-400">
            Map engagement charts compile dynamically as consumers explore your
            geo-coordinates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
