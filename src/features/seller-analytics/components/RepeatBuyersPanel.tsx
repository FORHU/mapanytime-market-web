import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Users } from "lucide-react";
import { BuyerMixDonut } from "./BuyerMixDonut";
import {
  formatCount,
  formatPercentage,
  returningBuyerShare,
  totalBuyers,
} from "../lib/derive";
import type { BuyerMix } from "../contracts/seller-analytics.contract";

interface RepeatBuyersPanelProps {
  buyers: BuyerMix;
}

export function RepeatBuyersPanel({ buyers }: RepeatBuyersPanelProps) {
  const total = totalBuyers(buyers);
  const share = returningBuyerShare(buyers);

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
            <Users className="w-4 h-4" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Local buyers
          </h3>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          {formatPercentage(share)} of your {formatCount(total)} buyers had
          ordered from you before.
        </p>

        <BuyerMixDonut buyers={buyers} />
      </CardContent>
    </Card>
  );
}
