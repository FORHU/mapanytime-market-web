"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatPeso, formatPesoCompact } from "@/shared/lib/currency";
import { toChartNumber } from "../lib/derive";
import type { RevenuePoint } from "../contracts/seller-analytics.contract";

interface RevenueTrendChartProps {
  data: RevenuePoint[];
  isLoading?: boolean;
}

/**
 * Revenue over the reporting window.
 *
 * Client component because recharts measures the DOM. Colours are CSS variables
 * rather than literals so the chart follows the theme toggle without a JS
 * subscription: `var(--brand-core)` and `var(--brand-vibrant)` resolve against
 * `.dark` at paint time.
 */
export function RevenueTrendChart({
  data,
  isLoading = false,
}: RevenueTrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-[320px] w-full rounded-2xl bg-[var(--background-tertiary)] animate-pulse" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[320px] w-full rounded-xl border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center gap-2 p-6 text-center">
        <BarChart3
          className="w-6 h-6 text-[var(--text-secondary)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[var(--text-secondary)]">
          No sales recorded in this period yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--brand-core)"
                stopOpacity={0.28}
              />
              <stop
                offset="95%"
                stopColor="var(--brand-core)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-light)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value: number) => formatPesoCompact(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background-elevated)",
              borderColor: "var(--border-default)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
            itemStyle={{ color: "var(--text-primary)" }}
            formatter={(value) => [formatPeso(toChartNumber(value)), "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--brand-core)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#analyticsRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
