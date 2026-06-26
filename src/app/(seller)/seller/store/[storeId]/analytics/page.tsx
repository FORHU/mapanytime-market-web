"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BarChart3, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
// Import responsive vector chart wrappers safely
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AnalyticsDataPoint {
  month: string;
  revenue: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const storeId = (params.storeId as string) || "STORE-9921";
  const [data, setData] = useState<AnalyticsDataPoint[]>([]);

  // 1. Multi-Store Analytics Dataset Matrix dictionary
  useEffect(() => {
    const mockDbAnalytics: Record<string, AnalyticsDataPoint[]> = {
      "STORE-9921": [
        { month: "Jan", revenue: 4500 },
        { month: "Feb", revenue: 5200 },
        { month: "Mar", revenue: 6100 },
        { month: "Apr", revenue: 5800 },
        { month: "May", revenue: 7100 },
        { month: "Jun", revenue: 8420 },
      ],
      "STORE-4401": [
        { month: "Jan", revenue: 8900 },
        { month: "Feb", revenue: 9400 },
        { month: "Mar", revenue: 11200 },
        { month: "Apr", revenue: 10500 },
        { month: "May", revenue: 13000 },
        { month: "Jun", revenue: 14500 },
      ],
      "STORE-1120": [
        { month: "Jan", revenue: 18000 },
        { month: "Feb", revenue: 22000 },
        { month: "Mar", revenue: 21000 },
        { month: "Apr", revenue: 28000 },
        { month: "May", revenue: 31000 },
        { month: "Jun", revenue: 32400 },
      ],
      "STORE-8873": [
        { month: "Jan", revenue: 34000 },
        { month: "Feb", revenue: 41000 },
        { month: "Mar", revenue: 39000 },
        { month: "Apr", revenue: 48000 },
        { month: "May", revenue: 52000 },
        { month: "Jun", revenue: 58910 },
      ],
    };

    setData(mockDbAnalytics[storeId] || mockDbAnalytics["STORE-9921"]);
  }, [storeId]);

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── HEADER ACTIONS PANEL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Business Intelligence Metrics
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Audit macro metrics, evaluate transaction value patterns, and
            inspect geographic performance markers.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all">
          <Calendar className="w-3.5 h-3.5" /> Select Time Horizon
        </button>
      </div>

      {/* ── ANALYTICS DATA SUMMARY ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Interactive Vector Chart Grid Area */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 tracking-tight">
              Revenue Trajectory Stream
            </h4>
            <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-0.5">
              +14.2% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          {/* High-Fidelity Area Vector Chart Canvas Layout */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analyticsGlow"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `₱${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#analyticsGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Conversion Summary Side panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 tracking-tight">
              Conversion Diagnostics
            </h4>
            <div className="space-y-3 font-bold text-xs">
              <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl flex justify-between">
                <span className="text-slate-400">Total Cart Additions</span>
                <span className="text-slate-800 font-mono">1,420 entries</span>
              </div>
              <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl flex justify-between">
                <span className="text-slate-400">Checkout Closures</span>
                <span className="text-slate-800 font-mono">342 logs</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100/70 rounded-2xl mt-6 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
            <p className="text-[11px] font-bold text-emerald-800 leading-normal">
              Discovery rates across hyperlocal mapping queries rose 8% over
              standard sector baselines this period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
