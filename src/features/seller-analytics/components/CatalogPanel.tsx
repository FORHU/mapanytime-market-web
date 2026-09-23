import React from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Boxes, AlertTriangle, PackageX, Eye } from "lucide-react";
import { formatPeso } from "@/shared/lib/currency";
import { SectionHeading } from "./SectionHeading";
import { formatCount } from "../lib/derive";
import type { CatalogSummary } from "../contracts/seller-analytics.contract";

interface CatalogPanelProps {
  catalog: CatalogSummary;
}

/**
 * Catalog health, and what is actually selling.
 *
 * Split rather than stacked: the four counts on the left are a status check, the
 * ranked list on the right is the thing a seller acts on. The list is a ranked
 * `<ol>`, not a second table, because five rows with a position and two figures
 * do not need column headers.
 */
export function CatalogPanel({ catalog }: CatalogPanelProps) {
  const counts = [
    {
      key: "active",
      label: "Active",
      value: formatCount(catalog.activeProducts),
      icon: Boxes,
      accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      valueClass: "text-[var(--text-primary)]",
    },
    {
      key: "low",
      label: "Low stock",
      value: formatCount(catalog.lowStockProducts),
      icon: AlertTriangle,
      accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "out",
      label: "Out of stock",
      value: formatCount(catalog.outOfStockProducts),
      icon: PackageX,
      accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
    },
    {
      key: "views",
      label: "Product views",
      value: formatCount(catalog.productViews),
      icon: Eye,
      accent: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      valueClass: "text-[var(--text-primary)]",
    },
  ];

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Catalog"
        description="Stock to watch, and the products earning the most."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
              {counts.map(
                ({ key, label, value, icon: Icon, accent, valueClass }) => (
                  <div key={key} className="space-y-1.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      {label}
                    </dt>
                    <dd
                      className={`text-xl font-semibold tabular-nums ${valueClass}`}
                    >
                      {value}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Top performing products
            </h3>

            {catalog.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                No product sales in this period yet.
              </p>
            ) : (
              <ol className="mt-3 space-y-1">
                {catalog.topProducts.map((product, index) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 py-2.5 border-b border-[var(--border-light)] last:border-0"
                  >
                    <span className="w-6 shrink-0 text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatCount(product.unitsSold)} sold,{" "}
                        {formatCount(product.views)} views
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                      {formatPeso(product.revenue, { decimals: false })}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
