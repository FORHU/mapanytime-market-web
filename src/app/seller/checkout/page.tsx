"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Link2, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Instant Checkout Configurations"
        description="Build direct checkout links for individual products, generate terminal configurations, and customize invoice templates."
      />

      <Card>
        <CardContent className="p-12 text-center py-16">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <Link2 className="w-5 h-5" />
          </div>
          <p
            className="text-xs font-medium max-w-xs mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Configure default instant-payment links. Allow customers to scan QR
            codes on physical maps to purchase items instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
