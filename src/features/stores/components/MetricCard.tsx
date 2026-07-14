"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  change?: number;
  isLoading?: boolean;
  isAlertTrigger?: boolean;
}

// ✅ FIXED: Explicit named export structure
export function MetricCard({
  title,
  value,
  change,
  isLoading = false,
  isAlertTrigger = false,
}: MetricCardProps) {
  if (isLoading || value === null) {
    return (
      <Card className="p-6 border border-[var(--border-default)] animate-pulse space-y-3">
        <div className="h-3 w-24 bg-[var(--border-strong)] rounded opacity-40" />
        <div className="h-7 w-32 bg-[var(--background-secondary)] rounded-xl" />
        <div className="h-3 w-16 bg-[var(--border-strong)] rounded opacity-20" />
      </Card>
    );
  }

  const cardBorderColor = isAlertTrigger
    ? "rgba(244, 63, 94, 0.4)"
    : "var(--border-default)";
  const valueTextColor = isAlertTrigger
    ? "text-rose-600 dark:text-rose-400"
    : "text-[var(--text-primary)]";
  const bgStyle = isAlertTrigger
    ? "bg-rose-50/20 dark:bg-rose-950/10"
    : "bg-[var(--background-elevated)]";

  return (
    <Card
      className={`p-6 border transition-all duration-300 ${bgStyle}`}
      style={{ borderColor: cardBorderColor }}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {isAlertTrigger && (
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`text-2xl font-black tracking-tight ${valueTextColor}`}
        >
          {value}
        </span>
      </div>
      {change !== undefined && !isAlertTrigger && (
        <div
          className={`mt-2 flex items-center gap-1 text-[11px] font-bold ${change >= 0 ? "text-emerald-500" : "text-rose-500"}`}
        >
          {change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {change >= 0 ? `+${change}%` : `${change}%`} vs last block
          </span>
        </div>
      )}
      {isAlertTrigger && (
        <div className="mt-2 text-[10px] font-bold text-rose-500 tracking-wide">
          Immediate stock reallocation context required.
        </div>
      )}
    </Card>
  );
}
