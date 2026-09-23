import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Info, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import { SectionHeading } from "./SectionHeading";
import { StatTile } from "./StatTile";
import { TimeRangeSwitcher } from "./TimeRangeSwitcher";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { PickupPerformancePanel } from "./PickupPerformancePanel";
import { XenditSummaryPanel } from "./XenditSummaryPanel";
import { XenditTransactionsTable } from "./XenditTransactionsTable";
import { LocalDiscoveryPanel } from "./LocalDiscoveryPanel";
import { CatalogPanel } from "./CatalogPanel";
import { AiListingPanel } from "./AiListingPanel";
import { RepeatBuyersPanel } from "./RepeatBuyersPanel";
import { averageOrderValue, formatCount } from "../lib/derive";
import { SELLER_ANALYTICS_SNAPSHOT } from "../testing/seller-analytics.fixture";

/**
 * Seller analytics, driven by a fixture.
 *
 * A Server Component: nothing on this page holds state, because the range
 * control is deliberately inert until there is a backend to filter. Only the two
 * recharts leaves are client components, so the interactive surface stays as
 * small as the page actually needs.
 *
 * To move this onto real data, replace the `snapshot` const with a parsed
 * response and thread `isLoading` through the tiles and charts, which already
 * accept it. Nothing else here should need to change.
 */
export function SellerAnalyticsWorkspace() {
  const snapshot = SELLER_ANALYTICS_SNAPSHOT;
  const { revenue } = snapshot;
  const aov = averageOrderValue(revenue.totalRevenue, revenue.totalOrders);

  return (
    <div className="space-y-10">
      {/* Says plainly that the figures are invented. Without this the page reads
          as a real report, which would be misleading rather than merely early.

          A plain tinted div, not a `Card`: Card applies its own inline
          backgroundColor and borderColor before spreading props, so those beat
          any tint class passed to it. This follows the notice pattern in
          `app/seller/promotions/page.tsx`. */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-left dark:border-sky-900 dark:bg-sky-950/20">
        <Info
          className="w-4 h-4 mt-0.5 shrink-0 text-sky-600 dark:text-sky-400"
          aria-hidden="true"
        />
        <p className="text-sm text-sky-900 dark:text-sky-200">
          <span className="font-semibold">Preview with sample data.</span> Every
          figure below is illustrative. Nothing here is read from your store or
          from Xendit yet.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeading
          title="Revenue"
          description={`Sales and orders for ${snapshot.rangeLabel.toLowerCase()}.`}
          action={<TimeRangeSwitcher />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            label="Total revenue"
            value={formatPeso(revenue.totalRevenue)}
            icon={TrendingUp}
            accent="emerald"
            change={revenue.revenueChangePercentage}
          />
          <StatTile
            label="Total orders"
            value={formatCount(revenue.totalOrders)}
            icon={ShoppingBag}
            accent="sky"
            change={revenue.orderChangePercentage}
          />
          <StatTile
            label="Average order value"
            value={formatPeso(aov)}
            hint="Revenue divided by orders"
            icon={Receipt}
            accent="violet"
          />
        </div>

        <Card>
          <CardContent>
            <RevenueTrendChart data={snapshot.revenueTrend} />
          </CardContent>
        </Card>
      </section>

      <PickupPerformancePanel pickup={snapshot.pickup} />

      <XenditSummaryPanel
        summary={snapshot.xenditSummary}
        totalOrders={revenue.totalOrders}
      />

      <XenditTransactionsTable transactions={snapshot.xenditTransactions} />

      <LocalDiscoveryPanel discovery={snapshot.discovery} />

      <CatalogPanel catalog={snapshot.catalog} />

      <section className="space-y-4">
        <SectionHeading
          title="Listings and buyers"
          description="How your listings get made, and who keeps coming back."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AiListingPanel activity={snapshot.aiListings} />
          <RepeatBuyersPanel buyers={snapshot.buyers} />
        </div>
      </section>
    </div>
  );
}
