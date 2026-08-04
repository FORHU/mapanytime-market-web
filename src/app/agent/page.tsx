"use client";

import {
  Headset,
  ShoppingBag,
  Store,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AgentDashboardPage() {
  const placeholderModules = [
    {
      title: "Order Oversight",
      description:
        "Track, review, and resolve marketplace orders across all stores.",
      icon: ShoppingBag,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-500/20",
    },
    {
      title: "Store Support",
      description:
        "Assist merchants with onboarding, verifications, and store issues.",
      icon: Store,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── WELCOME BANNER ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/40 via-cyan-900/30 to-[#082f49] border border-sky-500/20 p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Headset className="w-3.5 h-3.5" /> Agent Support Console
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Welcome, Agent!
            </h1>
            <p className="text-sm font-medium text-[var(--text-secondary)] max-w-xl">
              You are signed in to the MapAnytime agent workspace. Your support
              modules are being scaffolded — dashboard access is live today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Active Workspace
            </span>
          </div>
        </div>
      </div>

      {/* ─── PLACEHOLDER MODULE CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {placeholderModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.title}
              className={`p-6 rounded-2xl border ${module.border} bg-[var(--background-secondary)]/60 backdrop-blur-md space-y-4 hover:border-sky-500/40 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-2.5 rounded-xl ${module.bg} ${module.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-500/30">
                  Coming soon
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {module.title}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {module.description}
                </p>
              </div>
              <button className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1">
                Preview <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
