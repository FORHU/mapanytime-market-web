"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductTableProps {
  products: ProductItem[];
  onSelect: (product: ProductItem) => void;
}

export function ProductTable({ products, onSelect }: ProductTableProps) {
  return (
    <Card
      className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0 animate-in fade-in duration-200"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="py-3.5 px-4">Product Name</th>
              <th className="py-3.5 px-4">Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              <th className="py-3.5 px-4 text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[var(--border-light)]">
            {products.map((product, idx) => (
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
                <td className="py-4 px-4 font-semibold text-[var(--text-primary)]">
                  {product.name}
                </td>
                <td className="py-4 px-4 text-[var(--text-secondary)]">
                  {product.brand || "—"}
                </td>
                <td className="py-4 px-4">
                  <span
                    className="inline-block text-xs px-2 py-0.5 border rounded-md text-[var(--text-secondary)]"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    {product.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)]">
                  ₱
                  {Number(product.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={`py-4 px-4 text-right font-medium ${
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
