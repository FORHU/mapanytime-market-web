"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import {
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NeedsAttentionCardProps {
  pendingOrdersCount: number;
  readyForPickupCount: number;
  lowStockCount: number;
  isLoading?: boolean;
}

export function NeedsAttentionCard({
  pendingOrdersCount,
  readyForPickupCount,
  lowStockCount,
  isLoading = false,
}: NeedsAttentionCardProps) {
  const totalActionItems =
    pendingOrdersCount + readyForPickupCount + lowStockCount;

  if (isLoading) {
    return (
      <Card className="p-4 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded mb-3" />
        <div className="h-10 bg-[var(--background-tertiary)] rounded-xl" />
      </Card>
    );
  }

  if (totalActionItems === 0) {
    return (
      <Card
        className="p-4 border border-emerald-500/20 bg-emerald-500/5 shadow-sm text-left flex items-center justify-between"
        style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              You&apos;re all caught up
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              No orders or inventory items require immediate action right now.
            </p>
          </div>
        </div>
        <Link
          href="/seller/orders"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0"
        >
          View order pipeline <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className="p-4 border border-amber-500/20 bg-amber-500/5 shadow-sm text-left space-y-3"
      style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold tracking-tight text-amber-900 dark:text-amber-200">
            Needs Attention
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
            {totalActionItems} {totalActionItems === 1 ? "action" : "actions"}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">
          Prioritize urgent tasks
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {/* Pending Orders Action */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/seller/orders"
            className="p-3 rounded-xl bg-[var(--background-elevated)] border hover:border-[var(--brand-core)] hover:shadow-sm transition-all flex items-center justify-between group"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {pendingOrdersCount}{" "}
                  {pendingOrdersCount === 1 ? "order needs" : "orders need"}{" "}
                  preparation
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Start preparing in orders
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--brand-core)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        )}

        {/* Ready for Pickup Action */}
        {readyForPickupCount > 0 && (
          <Link
            href="/seller/orders"
            className="p-3 rounded-xl bg-[var(--background-elevated)] border hover:border-blue-500 hover:shadow-sm transition-all flex items-center justify-between group"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <PackageCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {readyForPickupCount}{" "}
                  {readyForPickupCount === 1 ? "order ready" : "orders ready"}{" "}
                  for pickup
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Awaiting customer handover
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        )}

        {/* Low Stock Action */}
        {lowStockCount > 0 && (
          <Link
            href="/seller/inventory"
            className="p-3 rounded-xl bg-[var(--background-elevated)] border hover:border-rose-500 hover:shadow-sm transition-all flex items-center justify-between group"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {lowStockCount}{" "}
                  {lowStockCount === 1 ? "product is" : "products are"} low in
                  stock
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  10 or fewer units left
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        )}
      </div>
    </Card>
  );
}
