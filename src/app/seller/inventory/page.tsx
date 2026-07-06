"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ListFilter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Control"
        description="Synchronize stock tiers, update SKU counts, and track warehouse asset reserves."
        action={
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900"
              style={{ borderColor: "var(--border-light)" }}
            >
              <ListFilter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90">
              Bulk Adjust
            </button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-8 text-center py-16">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Inventory synchronization matrix is ready. Start assigning digital
            parameters to live SKU lines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
