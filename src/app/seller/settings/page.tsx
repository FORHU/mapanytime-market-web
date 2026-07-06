"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sliders } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Adjust payout distributions, update alert notifications, and control account authentication metrics."
      />

      <Card>
        <CardContent className="p-12 text-center py-16">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Merchant control panel defaults are securely saved. Access
            notification parameters or team permissions here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
