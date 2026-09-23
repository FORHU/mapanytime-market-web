import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { MapPin, Store, MousePointerClick } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { StatTile } from "./StatTile";
import { formatCount } from "../lib/derive";
import type { LocalDiscovery } from "../contracts/seller-analytics.contract";

interface LocalDiscoveryPanelProps {
  discovery: LocalDiscovery;
}

/**
 * How buyers found the store on the map.
 *
 * Three counts plus the radius. The radius is a distance, not a tally, so it
 * gets its own panel instead of a fourth tile that would invite reading it as
 * one more number in the funnel.
 */
export function LocalDiscoveryPanel({ discovery }: LocalDiscoveryPanelProps) {
  const clickThrough =
    discovery.storeViews > 0
      ? (discovery.productClicks / discovery.storeViews) * 100
      : 0;

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Local discovery"
        description="How often your pin reached buyers nearby, and what they did next."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            label="Pin impressions"
            value={formatCount(discovery.pinImpressions)}
            hint="Times your pin was on screen"
            icon={MapPin}
            accent="sky"
          />
          <StatTile
            label="Store views"
            value={formatCount(discovery.storeViews)}
            hint="Opened your storefront"
            icon={Store}
            accent="violet"
          />
          <StatTile
            label="Product clicks"
            value={formatCount(discovery.productClicks)}
            hint={`${Math.round(clickThrough)}% of store views`}
            icon={MousePointerClick}
            accent="emerald"
          />
        </div>

        <Card className="flex flex-col justify-center">
          <CardContent>
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Discovery radius
            </span>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums">
                {discovery.discoveryRadiusKm}
              </span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                km
              </span>
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Buyers within this distance can see your pin on the map.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
