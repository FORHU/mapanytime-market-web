"use client";

import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Customer reviews
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          What customers say about your store.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center py-16 space-y-3">
          <div className="flex justify-center gap-1 text-[var(--border-strong)]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Reviews are coming soon
          </p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Once customers can rate your store, their feedback will show up
            here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
