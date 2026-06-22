"use client";

import Link from "next/link";
import {
  Plus,
  Coins,
  ShoppingBag,
  Store,
  Users,
  ArrowRight,
} from "lucide-react";

// ── 1. EMBEDDED SUB-COMPONENT: TOP PRODUCTS SIDEBAR CARD ──
function TopProductsCard() {
  const products = [
    {
      rank: 1,
      name: "Organic Veg Bundle",
      revenue: 1050,
      width: "w-full",
      sold: 84,
    },
    {
      rank: 2,
      name: "Local Honey 500ml",
      revenue: 854,
      width: "w-[81%]",
      sold: 61,
    },
    {
      rank: 3,
      name: "Dragon Fruit Pack",
      revenue: 408,
      width: "w-[39%]",
      sold: 48,
    },
    {
      rank: 4,
      name: "Cassava Chips 200g",
      revenue: 427,
      width: "w-[41%]",
      sold: 122,
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-900 tracking-tight">
          Top Products
        </h4>
        <Link
          href="/seller/analytics"
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
                  ${product.revenue}
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
  const metaCards = [
    {
      label: "Total Sales",
      value: "₱8,420",
      change: "+12%",
      icon: Coins,
      positive: true,
    },
    {
      label: "Orders Today",
      value: "34",
      change: "+8 new",
      icon: ShoppingBag,
      positive: true,
    },
    {
      label: "Products Listed",
      value: "142",
      change: "3 pending review",
      icon: Store,
      positive: true,
    },
    {
      label: "Pending Pickups",
      value: "7",
      change: "2 overdue",
      icon: Users,
      positive: false,
    },
  ];

  const recentOrders = [
    {
      id: "ORD-8900",
      buyer: "Budi Santoso",
      item: "Organic Veg Bundle × 2",
      amount: "₱25.00",
      status: "Pending",
      time: "5m ago",
    },
    {
      id: "ORD-8895",
      buyer: "Siti Rahayu",
      item: "Local Honey 500ml × 1",
      amount: "₱14.00",
      status: "Preparing",
      time: "18m ago",
    },
    {
      id: "ORD-8890",
      buyer: "Ahmad Fauzi",
      item: "Cassava Chips × 3",
      amount: "₱10.50",
      status: "Ready",
      time: "42m ago",
    },
    {
      id: "ORD-8881",
      buyer: "Dewi Lestari",
      item: "Dragon Fruit × 2",
      amount: "₱17.00",
      status: "Delivered",
      time: "1h ago",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dynamic Header Frame Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Seller Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Welcome back, Kedai Bu Sari · Today is Tue, Jun 17
          </p>
        </div>
        <Link
          href="/seller/upload"
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
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  card.label === "Pending Pickups"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
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
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
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

          {/* Wire-matrix visualization element with your specific design date blocks */}
          <div className="h-44 flex flex-col justify-between border-b border-slate-100 pb-2 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">
                Recharts Wire Component Mounting Overlay
              </span>
            </div>
            <div className="w-full flex justify-between text-[9px] font-bold text-slate-400 mt-auto pt-4 border-t border-slate-50">
              {["Jun 3", "Jun 6", "Jun 9", "Jun 12", "Jun 15", "Jun 17"].map(
                (d) => (
                  <span key={d} className="font-mono">
                    {d}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Right Column Stack: Scaled Revenue perform parameters sidebar card */}
        <div className="lg:col-span-2">
          <TopProductsCard />
        </div>
      </div>

      {/* Base Layer Table Block: Recent Orders tracking metrics history queue */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Recent Orders
          </h4>
          <Link
            href="/seller/orders"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all group"
          >
            View all
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
                          : order.status === "Preparing"
                            ? "bg-blue-50 text-blue-700 border border-blue-100/70"
                            : order.status === "Ready"
                              ? "bg-orange-50 text-orange-700 border border-orange-100/70"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100/70"
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
