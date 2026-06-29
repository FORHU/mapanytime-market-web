"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Coins,
  ShoppingBag,
  Store,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProductItem {
  rank: number;
  name: string;
  revenue: number;
  width: string;
  sold: number;
}

interface OrderItem {
  id: string;
  buyer: string;
  item: string;
  amount: string;
  status: string;
  time: string;
}

interface MetricCard {
  label: string;
  value: string;
  change: string;
  icon: any;
}

export default function SellerDashboardPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [storeName, setStoreName] = useState("Loading Store Profile...");
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    const fetchDashboardAggregation = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Dynamic fetch hitting the consolidated dashboard data endpoint
        const response = await fetch(
          `http://localhost:3002/api/v1/stores/${storeId}/dashboard`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error("Dashboard metrics unreachable.");
        const dbData = await response.json();

        setStoreName(dbData?.storeName || "Active Branch Profile");
        setChartData(dbData?.revenueChart || []);
        setTopProducts(dbData?.topProducts || []);
        setRecentOrders(dbData?.recentOrders || []);

        // Format incoming database counts into structural metric objects
        setMetrics([
          {
            label: "Total Sales",
            value: `₱${dbData?.metrics?.totalSales?.toLocaleString() || 0}`,
            change: dbData?.metrics?.salesChange || "Stable",
            icon: Coins,
          },
          {
            label: "Orders Today",
            value: String(dbData?.metrics?.ordersToday || 0),
            change: dbData?.metrics?.ordersChange || "Live",
            icon: ShoppingBag,
          },
          {
            label: "Products Listed",
            value: String(dbData?.metrics?.productsCount || 0),
            change: "Catalog Active",
            icon: Store,
          },
          {
            label: "Pending Pickups",
            value: String(dbData?.metrics?.pendingPickups || 0),
            change: "Queue Active",
            icon: Users,
          },
        ]);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardAggregation();
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-xs font-bold text-slate-400">
        Loading aggregate business ledger summary...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Panel
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Active Store Context:{" "}
            <span className="text-emerald-600 font-extrabold">{storeName}</span>{" "}
            · ID:{" "}
            <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
              {storeId}
            </span>
          </p>
        </div>
        <Link
          href={`/seller/store/${storeId}/products`}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Manage Catalog
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card, i) => (
          <div
            key={i}
            className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                {card.change}
              </span>
              <card.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-0.5">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Chart Canvas Area */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Revenue Overview
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="dashboardRevenueGlow"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
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
                  fill="url(#dashboardRevenueGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products List Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Top Products
          </h4>
          <div className="space-y-5">
            {topProducts.map((product) => (
              <div
                key={product.rank}
                className="flex items-start gap-4 text-xs font-bold"
              >
                <span className="text-slate-300 font-black text-center w-4 mt-0.5 flex-shrink-0">
                  {product.rank}
                </span>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-slate-800 tracking-tight block">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-slate-900 font-extrabold flex-shrink-0">
                      ₱{product.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: product.width }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Data Table Area */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Recent Orders Queue
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  <td className="py-3.5 px-6 text-slate-900 font-black">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    {order.buyer}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-500">
                    {order.item}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-mono">
                    {order.amount}
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-400 font-mono">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
