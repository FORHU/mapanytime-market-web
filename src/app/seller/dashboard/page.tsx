"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { SellerOrdersBoard } from "@/features/orders/components/SellerOrdersBoard";
import { useStoreOverviewStats } from "@/shared/hooks/useOrdersPipeline";
import { useProductsPipeline } from "@/shared/hooks/useProductsPipeline";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SellerDashboard() {
  const { userId, isHydrated } = useCurrentUser();
  const { activeStoreId } = useActiveStore();

  const { totalRevenue, pendingCount, fulfilledCount, isLoading } =
    useStoreOverviewStats({ userId });

  // Stock lives on products, not on orders — the orders API never reports it.
  const { products, isLoading: productsLoading } =
    useProductsPipeline(activeStoreId);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  const ordersReady = isHydrated && !isLoading;
  const stockReady = isHydrated && Boolean(activeStoreId) && !productsLoading;

  const stats = [
    {
      label: "Total sales",
      value: `₱${totalRevenue.toLocaleString()}`,
      hint: "Across all orders",
      icon: TrendingUp,
      accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      valueClass: "text-[var(--text-primary)]",
      ready: ordersReady,
    },
    {
      label: "Orders to handle",
      value: String(pendingCount),
      hint: "Waiting on you",
      icon: ShoppingBag,
      accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      valueClass: "text-amber-600 dark:text-amber-400",
      ready: ordersReady,
    },
    {
      label: "Completed orders",
      value: String(fulfilledCount),
      hint: "Picked up by customers",
      icon: CheckCircle2,
      accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
      ready: ordersReady,
    },
    {
      label: "Low stock",
      value: String(lowStockCount),
      hint: "Products with 10 or fewer left",
      icon: AlertTriangle,
      accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
      ready: stockReady,
    },
  ];

  return (
    <div className="space-y-8 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Your store at a glance
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sales, orders and stock for the store you&apos;re managing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/products">
            <Button variant="secondary" className="!text-sm border">
              <Package className="w-4 h-4" /> Manage products
            </Button>
          </Link>
          <Link href="/seller/ai-upload">
            <Button className="!text-sm bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md">
              <Sparkles className="w-4 h-4" /> AI import
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(
          ({ label, value, hint, icon: Icon, accent, valueClass, ready }) => (
            <Card
              key={label}
              className="p-4 border border-[var(--border-light)] bg-[var(--background-secondary)] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                {ready ? (
                  <span className={`text-2xl font-semibold ${valueClass}`}>
                    {value}
                  </span>
                ) : (
                  <span className="block h-8 w-20 rounded-md bg-[var(--background-tertiary)] animate-pulse" />
                )}
                <span className="text-xs text-[var(--text-secondary)] block mt-1">
                  {hint}
                </span>
              </div>
            </Card>
          ),
        )}
      </div>

      <SellerOrdersBoard variant="recent" />
    </div>
  );
}
