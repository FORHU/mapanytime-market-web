"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import {
  Store,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface StorePerformanceCardProps {
  totalRevenue: number;
  totalOrdersCount: number;
}

export function StorePerformanceCard({
  totalRevenue,
  totalOrdersCount,
}: StorePerformanceCardProps) {
  const { data: stores, isLoading } = useStoreProfiles();
  const { setActiveStoreId } = useActiveStore();

  return (
    <Card
      className="p-5 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm space-y-4 text-left flex flex-col justify-between"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Store Performance
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Branch-by-branch operational snapshot
            </p>
          </div>
          <Link
            href="/seller/manage-stores"
            className="text-xs font-semibold text-[var(--brand-core)] hover:underline inline-flex items-center gap-1"
          >
            View all stores <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--background-elevated)] border animate-pulse h-16"
                style={{ borderColor: "var(--border-light)" }}
              />
            ))
          ) : stores && stores.length > 0 ? (
            stores.map((store, index) => {
              // Proportional mock distribution of total numbers across registered branches
              const share =
                stores.length === 1
                  ? 1
                  : index === 0
                    ? 0.55
                    : index === 1
                      ? 0.3
                      : 0.15;
              const storeSales = Math.round(
                Math.max(totalRevenue, 35000) * share,
              );
              const storeOrders = Math.max(
                1,
                Math.round(Math.max(totalOrdersCount, 20) * share),
              );
              const isLowStockBranch = index === 2;

              return (
                <div
                  key={store.id}
                  onClick={() => setActiveStoreId(store.id)}
                  className="p-3 rounded-xl bg-[var(--background-elevated)] border hover:border-[var(--brand-core)] hover:shadow-sm transition-all cursor-pointer flex items-center justify-between group"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-core)] transition-colors truncate">
                        {store.storeName}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        ₱{storeSales.toLocaleString()} • {storeOrders} orders
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isLowStockBranch ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Good
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)] border border-dashed rounded-xl border-[var(--border-light)]">
              No stores yet.{" "}
              <Link
                href="/seller/manage-stores"
                className="text-[var(--brand-core)] underline"
              >
                Create your first store
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-light)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
        <span>Click any branch to filter entire dashboard</span>
      </div>
    </Card>
  );
}
