"use client";

import { ArrowUpRight, ArrowDownRight, Star } from "lucide-react";

export default function SellerAnalyticsPage() {
  const metaCards = [
    { label: "Revenue (Jun)", value: "₱8,420", change: "+18%", positive: true },
    { label: "New Customers", value: "142", change: "+31%", positive: true },
    {
      label: "Conversion Rate",
      value: "4.8%",
      change: "-0.3%",
      positive: false,
    },
    { label: "Avg Rating", value: "4.7 ★", change: "+0.2", positive: true },
  ];

  const weeklyRevenue = [
    { day: "Mon", amt: "₱1.2k", height: "h-[63px]" },
    { day: "Tue", amt: "₱1.0k", height: "h-[52px]" },
    { day: "Wed", amt: "₱1.4k", height: "h-[74px]" },
    { day: "Thu", amt: "₱1.1k", height: "h-[58px]" },
    { day: "Fri", amt: "₱1.7k", height: "h-[89px]" },
    { day: "Sat", amt: "₱1.3k", height: "h-[68px]" },
    { day: "Sun", amt: "₱1.9k", height: "h-[100px]", primary: true },
  ];

  const topProducts = [
    { rank: 1, name: "Organic Veg Bundle", revenue: 1050, width: "w-full" },
    { rank: 2, name: "Local Honey 500ml", revenue: 854, width: "w-[81%]" },
    { rank: 3, name: "Cassava Chips 200g", revenue: 427, width: "w-[41%]" },
    { rank: 4, name: "Dragon Fruit Pack", revenue: 408, width: "w-[39%]" },
    { rank: 5, name: "Fresh Coconut Water", revenue: 204, width: "w-[19%]" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── TOP SECTION: BANNER HEADER ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Performance overview for June 2025
        </p>
      </div>

      {/* ── 4-COLUMN STAT SPIT MATRIX ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metaCards.map((card, i) => (
          <div
            key={i}
            className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold ${card.positive ? "text-emerald-600" : "text-rose-500"}`}
              >
                {card.positive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.change}
              </span>
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

      {/* ── MIDDLE GRID LAYER: WEEKLY GRAPHS & SOURCE RATIOS ── */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left 3/5 Canvas Sidecar (Weekly Revenue Performance) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Weekly Revenue
          </h4>

          <div className="flex items-end justify-between pt-6 h-48 border-b border-slate-100 pb-2">
            {weeklyRevenue.map((bar, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 w-10 group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {bar.amt}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.primary
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/10"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  } ${bar.height}`}
                />
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2/5 Canvas Sidecar (Traffic Sources Donut + Sliders) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Traffic Sources
          </h4>

          <div className="relative w-32 h-32 mx-auto border-12 border-emerald-500 rounded-full flex items-center justify-center border-t-orange-400 border-l-blue-500 border-b-purple-500 shadow-xs">
            <div className="text-center">
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none">
                2,840
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                visits
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                type: "Map Discovery",
                pct: "62%",
                width: "w-[62%]",
                dot: "bg-emerald-500",
              },
              {
                type: "Search",
                pct: "22%",
                width: "w-[22%]",
                dot: "bg-blue-500",
              },
              {
                type: "Referral",
                pct: "11%",
                width: "w-[11%]",
                dot: "bg-orange-400",
              },
              {
                type: "Direct Link",
                pct: "5%",
                width: "w-[5%]",
                dot: "bg-purple-500",
              },
            ].map((source, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${source.dot}`}
                    />
                    {source.type}
                  </span>
                  <span className="text-slate-900 font-black">
                    {source.pct}
                  </span>
                </div>
                <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${source.dot} ${source.width} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BASE LAYER CARD: TOP PRODUCTS BREAKDOWN ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
        <h4 className="text-xs font-black text-slate-900 tracking-tight">
          Top Products by Revenue
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
                  <span className="text-slate-800 truncate tracking-tight font-bold">
                    {product.name}
                  </span>
                  <span className="text-emerald-500 font-extrabold flex-shrink-0 font-mono">
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
    </div>
  );
}
