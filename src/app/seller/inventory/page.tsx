"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Boxes } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Stock levels
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Keep track of how much of each product you have left.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--background-tertiary)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <Boxes className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Stock management is coming soon
          </p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            For now you can see and set stock for each item on the{" "}
            <Link
              href="/seller/products"
              className="text-[var(--brand-core)] hover:underline font-medium"
            >
              My products
            </Link>{" "}
            page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
