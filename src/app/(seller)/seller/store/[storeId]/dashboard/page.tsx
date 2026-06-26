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
// Import Recharts core sub-components safely
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── 1. EMBEDDED SUB-COMPONENT: TOP PRODUCTS SIDEBAR CARD ──
interface ProductItem {
  rank: number;
  name: string;
  revenue: number;
  width: string;
  sold: number;
}

function TopProductsCard({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const mockDbProducts: Record<string, ProductItem[]> = {
      "STORE-9921": [
        {
          rank: 1,
          name: "Bulalo Family Size",
          revenue: 4200,
          width: "w-full",
          sold: 84,
        },
        {
          rank: 2,
          name: "Sizzling Sisig",
          revenue: 2440,
          width: "w-[58%]",
          sold: 61,
        },
        {
          rank: 3,
          name: "Lechon Kawali",
          revenue: 1800,
          width: "w-[42%]",
          sold: 36,
        },
      ],
      "STORE-4401": [
        {
          rank: 1,
          name: "Beachside Cocktail Pitcher",
          revenue: 6500,
          width: "w-full",
          sold: 130,
        },
        {
          rank: 2,
          name: "Grilled Seafood Platter",
          revenue: 4800,
          width: "w-[73%]",
          sold: 24,
        },
        {
          rank: 3,
          name: "Crispy Calamari Basket",
          revenue: 3200,
          width: "w-[49%]",
          sold: 64,
        },
      ],
      "STORE-1120": [
        {
          rank: 1,
          name: "Mechanical Gaming Keyboard",
          revenue: 8900,
          width: "w-full",
          sold: 4,
        },
        {
          rank: 2,
          name: "Ergonomic Vertical Mouse",
          revenue: 4500,
          width: "w-[50%]",
          sold: 9,
        },
        {
          rank: 3,
          name: "RGB Desk Mat Extra Large",
          revenue: 1200,
          width: "w-[13%]",
          sold: 12,
        },
      ],
      "STORE-8873": [
        {
          rank: 1,
          name: "Premium Jasmine Rice 25kg",
          revenue: 14500,
          width: "w-full",
          sold: 10,
        },
        {
          rank: 2,
          name: "Fresh Baguio Strawberries 1kg",
          revenue: 7200,
          width: "w-[49%]",
          sold: 24,
        },
        {
          rank: 3,
          name: "Native Benguet Coffee Beans",
          revenue: 3800,
          width: "w-[26%]",
          sold: 19,
        },
      ],
    };

    const fallbackProducts = [
      {
        rank: 1,
        name: "Standard Retail Bundle",
        revenue: 1200,
        width: "w-full",
        sold: 40,
      },
    ];

    setProducts(mockDbProducts[storeId] || fallbackProducts);
  }, [storeId]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-900 tracking-tight">
          Top Products
        </h4>
        <Link
          href={`/seller/store/${storeId}/analytics`}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
        >
          Analytics &gt;
        </Link>
      </div>

      <div className="space-y-5">
        {products.map((product) => (
          <div
            key={product.rank}
            className="flex items-start gap-4 text-xs font-bold"
          >
            <span className="text-slate-300 font-black text-center w-4 mt-0.5 flex-shrink-0">
              {product.rank}
            </span>

            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate pr-2">
                  <span className="text-slate-800 truncate tracking-tight font-bold block">
                    {product.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                    {product.sold} sold
                  </span>
                </div>
                <span className="text-slate-900 font-extrabold flex-shrink-0 font-mono">
                  ₱{product.revenue.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-emerald-500 rounded-full ${product.width}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. MAIN HUB DASHBOARD FRAMEWORK PAGE ──
export default function SellerDashboardPage() {
  const params = useParams();
  const storeId = (params.storeId as string) || "STORE-9921";

  const storeNames: Record<string, string> = {
    "STORE-9921": "Lola Joe's Restaurant",
    "STORE-4401": "Sea Waves Chalet Beach Resort",
    "STORE-1120": "Cordillera Sentinel Tech Shop",
    "STORE-8873": "Downtown Grocers",
  };
  const activeStoreName = storeNames[storeId] || "Alpha Branch Profile";

  const storeMetrics: Record<
    string,
    { label: string; value: string; change: string; icon: any }[]
  > = {
    "STORE-9921": [
      { label: "Total Sales", value: "₱8,420", change: "+12%", icon: Coins },
      {
        label: "Orders Today",
        value: "5",
        change: "+2 new",
        icon: ShoppingBag,
      },
      {
        label: "Products Listed",
        value: "42",
        change: "Menu Active",
        icon: Store,
      },
      {
        label: "Pending Pickups",
        value: "3",
        change: "Table Queue",
        icon: Users,
      },
    ],
    "STORE-4401": [
      { label: "Total Sales", value: "₱14,500", change: "+18%", icon: Coins },
      {
        label: "Orders Today",
        value: "2",
        change: "Peak Hour",
        icon: ShoppingBag,
      },
      {
        label: "Products Listed",
        value: "18",
        change: "Resort Active",
        icon: Store,
      },
      {
        label: "Pending Pickups",
        value: "1",
        change: "Cabana Delivery",
        icon: Users,
      },
    ],
    "STORE-1120": [
      { label: "Total Sales", value: "₱32,400", change: "+5%", icon: Coins },
      {
        label: "Orders Today",
        value: "0",
        change: "Restocking",
        icon: ShoppingBag,
      },
      {
        label: "Products Listed",
        value: "156",
        change: "In Stock",
        icon: Store,
      },
      {
        label: "Pending Pickups",
        value: "0",
        change: "Clean Queue",
        icon: Users,
      },
    ],
    "STORE-8873": [
      { label: "Total Sales", value: "₱58,910", change: "+24%", icon: Coins },
      {
        label: "Orders Today",
        value: "12",
        change: "+4 pending",
        icon: ShoppingBag,
      },
      {
        label: "Products Listed",
        value: "840",
        change: "Bulk Inventory",
        icon: Store,
      },
      {
        label: "Pending Pickups",
        value: "9",
        change: "Loading Dock",
        icon: Users,
      },
    ],
  };

  const metaCards = storeMetrics[storeId] || storeMetrics["STORE-9921"];

  const storeOrders: Record<
    string,
    {
      id: string;
      buyer: string;
      item: string;
      amount: string;
      status: string;
      time: string;
    }[]
  > = {
    "STORE-9921": [
      {
        id: "ORD-8900",
        buyer: "Mark Tan",
        item: "Bulalo Family Size × 1",
        amount: "₱450",
        status: "Pending",
        time: "5m ago",
      },
      {
        id: "ORD-8895",
        buyer: "Siti Rahayu",
        item: "Sizzling Sisig × 1",
        amount: "₱220",
        status: "Preparing",
        time: "18m ago",
      },
    ],
    "STORE-4401": [
      {
        id: "ORD-4401",
        buyer: "Alice Villa",
        item: "Beachside Cocktail Pitcher × 2",
        amount: "₱1,300",
        status: "Pending",
        time: "12m ago",
      },
      {
        id: "ORD-4402",
        buyer: "John Doe",
        item: "Grilled Seafood Platter × 1",
        amount: "₱4,800",
        status: "Preparing",
        time: "45m ago",
      },
    ],
    "STORE-1120": [
      {
        id: "ORD-1101",
        buyer: "Dave Agpaoa",
        item: "Mechanical Gaming Keyboard × 1",
        amount: "₱2,450",
        status: "Preparing",
        time: "2h ago",
      },
    ],
    "STORE-8873": [
      {
        id: "ORD-8801",
        buyer: "Maria Luisa",
        item: "Premium Jasmine Rice 25kg × 2",
        amount: "₱2,900",
        status: "Pending",
        time: "1m ago",
      },
      {
        id: "ORD-8802",
        buyer: "Kevin Reyes",
        item: "Native Benguet Coffee Beans × 3",
        amount: "₱600",
        status: "Pending",
        time: "4m ago",
      },
    ],
  };

  const recentOrders = storeOrders[storeId] || storeOrders["STORE-9921"];

  // 4. Dynamic Multi-Store Graph Dataset Matrix
  const chartDatasets: Record<string, { date: string; revenue: number }[]> = {
    "STORE-9921": [
      { date: "Jun 3", revenue: 1200 },
      { date: "Jun 6", revenue: 2400 },
      { date: "Jun 9", revenue: 1800 },
      { date: "Jun 12", revenue: 4900 },
      { date: "Jun 15", revenue: 6200 },
      { date: "Jun 17", revenue: 8420 },
    ],
    "STORE-4401": [
      { date: "Jun 3", revenue: 3100 },
      { date: "Jun 6", revenue: 5800 },
      { date: "Jun 9", revenue: 4200 },
      { date: "Jun 12", revenue: 9400 },
      { date: "Jun 15", revenue: 11200 },
      { date: "Jun 17", revenue: 14500 },
    ],
    "STORE-1120": [
      { date: "Jun 3", revenue: 14000 },
      { date: "Jun 6", revenue: 19500 },
      { date: "Jun 9", revenue: 12000 },
      { date: "Jun 12", revenue: 26000 },
      { date: "Jun 15", revenue: 29000 },
      { date: "Jun 17", revenue: 32400 },
    ],
    "STORE-8873": [
      { date: "Jun 3", revenue: 22000 },
      { date: "Jun 6", revenue: 35000 },
      { date: "Jun 9", revenue: 28000 },
      { date: "Jun 12", revenue: 44000 },
      { date: "Jun 15", revenue: 51000 },
      { date: "Jun 17", revenue: 58910 },
    ],
  };

  const activeChartData = chartDatasets[storeId] || chartDatasets["STORE-9921"];

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dynamic Header Frame Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Panel
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Active Store Context:{" "}
            <span className="text-emerald-600 font-extrabold">
              {activeStoreName}
            </span>{" "}
            · ID:{" "}
            <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
              {storeId}
            </span>
          </p>
        </div>
        <Link
          href={`/seller/store/${storeId}/upload`}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      {/* 4 Stat Cards Summary Ribbon row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metaCards.map((card, i) => (
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

      {/* Split Component Mid-Grid layer */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left Column Stack: Timeline Tracker Graphic Element Container */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 tracking-tight">
              Revenue Overview
            </h4>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold text-slate-500">
              <button className="px-2.5 py-1">7D</button>
              <button className="px-2.5 py-1 bg-white text-slate-900 rounded shadow-2xs">
                30D
              </button>
              <button className="px-2.5 py-1">90D</button>
            </div>
          </div>

          {/* Live High-Fidelity Area Vector Graph Rendering Interface Canvas */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activeChartData}
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
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
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
                  fill="url(#dashboardRevenueGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column Stack: Scaled Revenue perform parameters sidebar card */}
        <div className="lg:col-span-2">
          <TopProductsCard storeId={storeId} />
        </div>
      </div>

      {/* Base Layer Table Block: Recent Orders tracking metrics history queue */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Recent Orders Queue
          </h4>
          <Link
            href={`/seller/store/${storeId}/orders`}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all group"
          >
            View all{" "}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  <td className="py-3.5 px-6 font-black text-slate-900">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    {order.buyer}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-500">
                    {order.item}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 font-mono">
                    {order.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
                        order.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100/70"
                          : "bg-blue-50 text-blue-700 border border-blue-100/70"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-400 font-mono font-medium">
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
