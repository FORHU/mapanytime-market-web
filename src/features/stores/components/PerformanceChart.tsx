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
import { ChartDataPoint } from "@/shared/types/analytics";
import { BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

// ✅ FIXED: Explicit named export structure
export function PerformanceChart({
  data,
  isLoading = false,
}: PerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="h-[350px] w-full border border-dashed border-[var(--border-strong)] rounded-2xl flex flex-col items-center justify-center p-6 bg-[var(--background-elevated)] animate-pulse">
        <div className="h-6 w-6 rounded-full bg-[var(--background-tertiary)] animate-spin" />
        <span className="text-xs text-zinc-400 mt-2 font-medium">
          Re-indexing structural trend vectors...
        </span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full border border-dashed border-[var(--border-strong)] rounded-2xl flex flex-col items-center justify-center p-6 bg-[var(--background-elevated)] text-zinc-400">
        <BarChart3 className="w-8 h-8 text-zinc-300 mb-2" />
        <span className="text-xs font-bold tracking-tight">
          No transactional data available for this range parameters.
        </span>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full p-4 bg-[var(--background-elevated)] rounded-2xl border border-[var(--border-default)] shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--brand-core)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--brand-core)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="velocityGlow" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--brand-vibrant)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--brand-vibrant)"
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
            dataKey="date"
            stroke="var(--text-tertiary)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background-elevated)",
              borderColor: "var(--border-strong)",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue ($)"
            stroke="var(--brand-core)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueGlow)"
          />
          <Area
            type="monotone"
            dataKey="salesVelocity"
            name="Velocity (Units)"
            stroke="var(--brand-vibrant)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#velocityGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
