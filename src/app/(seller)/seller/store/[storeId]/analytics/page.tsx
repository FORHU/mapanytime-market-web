"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getAnalytics } from "@/features/dashboard/api/analytics.api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!storeId) return;
    getAnalytics(storeId)
      .then((dbData) => setData(dbData?.revenueStreams || dbData || []))
      .catch((err) => console.error(err));
  }, [storeId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
        Business Intelligence Stream
      </h1>
      <div className="bg-white border border-slate-200 rounded-3xl p-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₱${value}`, "Revenue"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fillOpacity={0.1}
              fill="#10b981"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
