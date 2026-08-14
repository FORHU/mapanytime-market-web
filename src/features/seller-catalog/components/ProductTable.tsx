"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductTableProps {
  products: ProductItem[];
  onSelect: (product: ProductItem) => void;
}

type SortDirection = "asc" | "desc" | null;

export function ProductTable({ products, onSelect }: ProductTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const parsePrice = (value: string) =>
    Number(String(value).replace(/[^0-9.-]/g, "")) || 0;

  const sortedProducts = useMemo(() => {
    if (!sortDirection) return products;
    return [...products].sort((a, b) => {
      const diff = parsePrice(a.price) - parsePrice(b.price);
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [products, sortDirection]);
  return (
    <Card
      className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0 animate-in fade-in duration-200"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="w-full overflow-auto h-[660px]">
        <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] sticky top-0 z-10">
              <th className="py-3.5 px-4 w-[22%]">Product Name</th>
              <th className="py-3.5 px-4 w-[15%]">Brand</th>
              <th className="py-3.5 px-4 w-[18%]">Category</th>
              <th
                className="py-3.5 px-4 text-right w-[15%] cursor-pointer select-none"
                aria-sort={
                  sortDirection === "asc"
                    ? "ascending"
                    : sortDirection === "desc"
                      ? "descending"
                      : undefined
                }
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Price
                  {sortDirection === "asc" ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : sortDirection === "desc" ? (
                    <ArrowDown className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                  )}
                </span>
              </th>
              <th className="py-3.5 px-4 text-right w-[15%]">Stock</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[var(--border-light)]">
            {sortedProducts.map((product, idx) => (
              <tr
                key={product.id || idx}
                onClick={() => onSelect(product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(product);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-[var(--background-secondary)]/40 focus-visible:outline-none focus-visible:bg-[var(--background-secondary)]/40"
              >
                <td className="py-4 px-4 font-semibold text-[var(--text-primary)] truncate">
                  {product.name}
                </td>
                <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                  {product.brand || "—"}
                </td>
                <td className="py-4 px-4">
                  <span
                    className="inline-block text-xs px-2 py-0.5 border rounded-md text-[var(--text-secondary)] truncate max-w-full"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    {product.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)] truncate">
                  ₱
                  {Number(product.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={`py-4 px-4 text-right font-medium truncate ${
                    product.stock === 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of stock"
                    : `${product.stock} in stock`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
