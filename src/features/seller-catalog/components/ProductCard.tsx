"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/shared/components/ui/Card";
import { Tag, Layers, Package } from "lucide-react";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card
      hoverable
      className="p-3 flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-core)]"
      style={{ borderColor: "var(--border-light)" }}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product);
        }
      }}
    >
      {product.imageUrl ? (
        <div className="relative mb-2.5 h-32 sm:h-36 w-full overflow-hidden rounded-xl">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="mb-2.5 flex h-32 sm:h-36 w-full items-center justify-center rounded-xl"
          style={{ background: "var(--background-secondary)" }}
        >
          <Package
            className="h-7 w-7"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>
      )}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] line-clamp-1 break-words">
              {product.name}
            </h3>
            {product.brand && (
              <span className="text-xs text-[var(--text-secondary)] block mt-0.5 line-clamp-1">
                by {product.brand}
              </span>
            )}
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 border rounded-md text-[var(--text-secondary)] shrink-0"
            style={{ borderColor: "var(--border-light)" }}
          >
            {product.category}
          </span>
        </div>
        <p
          className="text-xs mb-2 line-clamp-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {product.description || "No description yet."}
        </p>
      </div>

      <div
        className="flex items-center justify-between pt-2 border-t text-xs font-medium text-[var(--text-secondary)]"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-semibold">
            ₱
            {Number(product.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span
            className={
              product.stock === 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }
          >
            {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
      </div>
    </Card>
  );
}
