"use client";

// Live data, as of 2026-08-18 — this closes docs/connection-audit.md §7 for this
// page. Every number below comes from GET /api/v1/admin/approvals/dashboard.
// The mock "+18.4%" style deltas were removed rather than reimplemented: the API
// has no period-over-period comparison to base them on, and a fabricated delta
// beside a real figure is worse than no delta.
// See mapanytime-api/docs/payments-rework-review.md §13.
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Zap,
  BarChart3,
  DollarSign,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/shared/config/api";
import { getToken } from "@/shared/lib/token";

type DashboardData = {
  kpis: {
    totalRevenue: number;
    verifiedStores: number;
    activeUsers: number;
    pendingStoreApprovals: number;
    completedOrders: number;
  };
  chartData: { month: string; revenue: number; orders: number }[];
  pendingStores: {
    id: string;
    name: string;
    owner: string;
    email: string;
    category: string;
    date: string;
    avatar: string;
  }[];
  recentOrders: {
    id: string;
    store: string;
    buyer: string;
    amount: number;
    type: string;
    status: string;
    time: string;
  }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // getToken(), not localStorage — tokens moved to sessionStorage on
        // 2026-08-17 and getToken() purges the legacy localStorage key on every
        // read, so reading it directly always yielded null.
        // See mapanytime-api/docs/payments-rework-review.md §10.
        const token = getToken();
        const res = await fetch(
          `${API_BASE_URL}/api/v1/admin/approvals/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(
            result.message ?? "The dashboard metrics request was rejected.",
          );
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(
          "Could not reach the API. Check that it is running and you are signed in.",
        );
      }
    };
    fetchData();
  }, []);

  // A silent console.error behind an indefinite spinner is indistinguishable
  // from a hang, which is exactly how §10 stayed invisible.
  if (error) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="font-semibold text-[var(--text-primary)]">
          Could not load dashboard metrics
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  if (!data)
    return <div className="p-8 text-center">Loading dashboard metrics...</div>;

  const kpiCards = [
    {
      title: "Total Marketplace Revenue",
      value: data.kpis.totalRevenue.toLocaleString("en-US", {
        style: "currency",
        currency: "PHP",
      }),
      change: `${data.kpis.completedOrders.toLocaleString()} completed orders`,
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Verified Stores",
      value: data.kpis.verifiedStores.toString(),
      change: "Approved and live",
      trend: "up",
      icon: Store,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-500/20",
    },
    {
      title: "Active Buyers & Sellers",
      value: data.kpis.activeUsers.toLocaleString(),
      change: "Buyers and sellers",
      trend: "up",
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Pending Store Approvals",
      value: `${data.kpis.pendingStoreApprovals} Stores`,
      change: "Action Required",
      trend: "warn",
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-500/20",
    },
  ];

  const chartData = data.chartData;
  const pendingStores = data.pendingStores;
  const recentOrders = data.recentOrders;

  return (
    <div className="space-y-8">
      {/* ─── BANNER / HEADER ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/40 via-cyan-900/30 to-[#082f49] border border-sky-500/20 p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Platform Control Center
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              MapAnytime Admin Console
            </h1>
            <p className="text-sm font-medium text-[var(--text-secondary)] max-w-xl">
              Monitor store verifications, marketplace volume, user roles, and
              system order activities across all active locations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/stores")}
              className="px-5 py-3 rounded-2xl bg-[var(--brand-core)] hover:bg-sky-400 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2 shrink-0"
            >
              <Store className="w-4 h-4" /> Review Pending Stores
            </button>
          </div>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-6 rounded-2xl border ${kpi.border} bg-[var(--background-secondary)]/60 backdrop-blur-md space-y-4 hover:border-sky-500/40 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className={kpi.color}>{kpi.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── CHARTS & PENDING ACTIONS ─── */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Marketplace Revenue Trends
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Gross Merchandise Value (GMV) across verified merchant stores
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--background-primary)] text-xs font-semibold text-[var(--text-secondary)]">
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" /> H1 2026
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(14, 165, 233, 0.1)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(125, 211, 252, 0.7)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tick={{ fill: "rgba(125, 211, 252, 0.7)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(8, 47, 73, 0.95)",
                    borderColor: "rgba(34, 211, 238, 0.3)",
                    borderRadius: "12px",
                    color: "#f0f9ff",
                    fontSize: "13px",
                  }}
                  formatter={(value: any) => [
                    `$${Number(value).toLocaleString()}`,
                    "GMV Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals Widget */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Pending Merchant Stores
              </h2>
            </div>
            <button
              onClick={() => router.push("/admin/stores")}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingStores.map((store) => (
              <div
                key={store.id}
                className="p-4 rounded-2xl border border-[var(--border-light)] bg-[var(--background-primary)]/80 space-y-3 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">
                      {store.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                        {store.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {store.category}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-light)]">
                  <span className="text-[var(--text-tertiary)]">
                    {store.owner}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    {store.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RECENT SYSTEM ORDERS & QUICK ACTIONS ─── */}
      <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Live Order Activity Stream
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Real-time orders processed through MapAnytime backend API
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/orders")}
            className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs font-bold text-cyan-400 hover:bg-[var(--background-tertiary)] transition-colors self-start sm:self-auto"
          >
            All Order Records →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)] text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                <th className="pb-3 px-4">Order ID</th>
                <th className="pb-3 px-4">Store</th>
                <th className="pb-3 px-4">Buyer</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] text-sm">
              {recentOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-[var(--background-tertiary)]/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-400 text-xs">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                    {ord.store}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    {ord.buyer}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400">
                      {ord.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                    {ord.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : ord.status === "PROCESSING"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-[var(--text-tertiary)]">
                    {ord.time}
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
