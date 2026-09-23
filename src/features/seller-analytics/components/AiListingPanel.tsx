import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sparkles } from "lucide-react";
import { formatCount, formatDuration, formatPercentage } from "../lib/derive";
import type { AiListingActivity } from "../contracts/seller-analytics.contract";

interface AiListingPanelProps {
  activity: AiListingActivity;
}

export function AiListingPanel({ activity }: AiListingPanelProps) {
  const rows = [
    {
      key: "created",
      label: "Listings created",
      value: formatCount(activity.listingsCreated),
    },
    {
      key: "duration",
      label: "Average time to publish",
      value: formatDuration(activity.averageListingSeconds),
    },
    {
      key: "rate",
      label: "Published without edits",
      value: formatPercentage(activity.successRatePercentage),
    },
  ];

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            AI listing activity
          </h3>
        </div>

        <dl className="space-y-1">
          {rows.map(({ key, label, value }) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[var(--border-light)] last:border-0"
            >
              <dt className="text-sm text-[var(--text-secondary)]">{label}</dt>
              <dd className="text-lg font-semibold text-[var(--text-primary)] tabular-nums shrink-0">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
