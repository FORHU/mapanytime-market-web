"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { MessageSquare, Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consumer Reviews"
        description="Moderate hyperlocal buyer feedback, respond to star ratings, and manage customer relations."
      />

      <Card>
        <CardContent className="p-12 text-center py-16">
          <div className="flex justify-center gap-1 mb-3 text-zinc-300 dark:text-zinc-700">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            No reviews logged yet. Customer input metrics appear following
            successful store interactions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
