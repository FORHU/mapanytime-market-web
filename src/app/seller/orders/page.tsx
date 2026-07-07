"use client";

import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Clock } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-400">
              Incoming Pickups
            </span>
            <div className="text-xl font-black">0 Pending</div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center py-16">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Awaiting customer checkout actions. Incoming map orders will stream
            here in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
