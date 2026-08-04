"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { LineChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Sales reports
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          See how your store is doing over time.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--background-tertiary)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <LineChart className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Sales reports are coming soon
          </p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            In the meantime, your totals for sales and completed orders are on
            the{" "}
            <Link
              href="/seller/dashboard"
              className="text-[var(--brand-core)] hover:underline font-medium"
            >
              dashboard
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
