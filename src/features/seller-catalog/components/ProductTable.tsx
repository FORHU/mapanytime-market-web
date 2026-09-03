"use client";

import React from "react";
import { InfoIcon } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductTableProps {
  products: ProductItem[];
  onSelect: (product: ProductItem) => void;
  showStoreColumn?: boolean;
}

export function ProductTable({
  products,
  onSelect,
  showStoreColumn = false,
}: ProductTableProps) {
  return (
    <Card
      className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0 animate-in fade-in duration-200"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="w-full overflow-auto h-[600px]">
        <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] sticky top-0 z-10">
              <th
                className={`py-3.5 px-4 ${showStoreColumn ? "w-[20%]" : "w-[24%]"}`}
              >
                Product Name
              </th>
              <th
                className={`py-3.5 px-4 ${showStoreColumn ? "w-[12%]" : "w-[16%]"}`}
              >
                Brand
              </th>
              {showStoreColumn && (
                <th className="py-3.5 px-4 w-[16%]">Store</th>
              )}
              <th className="py-3.5 px-4 w-[18%]">Category</th>
              <th className="py-3.5 px-4 text-right w-[16%]">Price</th>
              <th className="py-3.5 px-4 text-right w-[14%]">Stock</th>
              <th className="py-3.5 px-4 text-center w-[12%]">Info</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[var(--border-light)]">
            {products.map((product, idx) => (
              <tr
                key={product.id || idx}
                className="transition-colors hover:bg-[var(--background-secondary)]/20"
              >
                <td className="py-4 px-4 font-semibold text-[var(--text-primary)] truncate">
                  {product.name}
                </td>
                <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                  {product.brand || "—"}
                </td>
                {showStoreColumn && (
                  <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                    {product.storeName || "—"}
                  </td>
                )}
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
                <td className="py-4 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelect(product)}
                    aria-label={`View ${product.name}`}
                    title="View product"
                    className="inline-flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--brand-core)] hover:bg-[var(--background-secondary)] transition-colors border border-transparent hover:border-[var(--border-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-core)]"
                  >
                    <InfoIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
