"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { Button } from "@/shared/components/ui/Button";
import {
  KPIMetrics,
  ChartDataPoint,
  TimeRangeToken,
} from "@/shared/types/analytics";
import { CalendarDays, RefreshCw } from "lucide-react";

export default function AnalyticsWorkspace() {
  const [range, setRange] = useState<TimeRangeToken>("7d");
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Date Range Payload Engine with direct string query interpolation
  const fetchAnalyticsData = useCallback(
    async (selectedRange: TimeRangeToken) => {
      try {
        setIsHydrating(true);

        // Append criteria as uniform parameters to targeted production instance API mapping
        const targetUrl = `/api/seller/analytics?range=${encodeURIComponent(selectedRange)}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
          throw new Error("Server gateway cluster refused query evaluation.");
        }

        const payload = await response.json();

        setMetrics(payload.metrics);
        setChartData(payload.chartData);
      } catch (err) {
        console.error("Failed to fetch analytics structural vectors:", err);
        // Fallback state mapping protection matrices on failure drops
        setMetrics(null);
        setChartData([]);
      } finally {
        setIsHydrating(false);
      }
    },
    [],
  );

  // Hook reactive anchor trigger instantly executing on state adjustments
  useEffect(() => {
    fetchAnalyticsData(range);
  }, [range, fetchAnalyticsData]);

  // Conditional Warning Parsing Flag Calculations
  const isStockLevelCritical = (metrics?.lowStockCount ?? 0) > 0;

  return (
    <div className="space-y-6 w-full text-left">
      {/* HEADER NODE CONTROL TOOLBAR CONTAINER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--background-elevated)] border border-[var(--border-light)] shadow-sm">
        <div className="space-y-0.5">
          <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
            Commercial Performance Vector
          </h2>
          <p className="text-[11px] text-zinc-400">
            Real-time system telemetry and tracking velocity indicators
          </p>
        </div>

        {/* Chronological Segment Control Panel Selection Switches */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-[var(--background-secondary)] p-1 rounded-xl border border-[var(--border-light)] w-full sm:w-auto">
            {(["7d", "30d", "90d"] as TimeRangeToken[]).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                disabled={isHydrating}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  range === t
                    ? "bg-[var(--brand-core)] text-white shadow-sm"
                    : "text-zinc-500 hover:text-[var(--text-primary)]"
                }`}
              >
                {/* ✅ FIXED: Pure string expression tree evaluation safely parsed by SWC build workers */}
                {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => fetchAnalyticsData(range)}
            disabled={isHydrating}
            className="!w-9 !h-9 !p-0 !rounded-xl border"
            style={{ borderColor: "var(--border-light)" }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-zinc-500 ${isHydrating ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* PROP-DRIVEN METRIC DISPLAY LAYER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Aggregated Block Revenue"
          value={
            metrics?.revenue
              ? `$${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : null
          }
          change={metrics?.revenueGrowthPercentage}
          isLoading={isHydrating}
        />

        <MetricCard
          title="Active Manifest Orders"
          value={metrics?.activeOrders ?? null}
          change={metrics?.orderGrowthPercentage}
          isLoading={isHydrating}
        />

        {/* Conditional style warning calculation target element anchor */}
        <MetricCard
          title="Low Stock Alarm Nodes"
          value={metrics?.lowStockCount ?? null}
          isAlertTrigger={isStockLevelCritical}
          isLoading={isHydrating}
        />
      </div>

      {/* HISTORICAL TREND VISUALIZATION METRIC CHART CANVAS BLOCK */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-core)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Velocity Profile Tracking Line Matrix
          </span>
        </div>
        <PerformanceChart data={chartData} isLoading={isHydrating} />
      </div>
    </div>
  );
}
