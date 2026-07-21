"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Boxes, Tag, Layers, AlertCircle } from "lucide-react";
import type { InventoryItem } from "../contracts/inventory.contract";

interface InventoryListProps {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onSelectItem: (productId: string) => void;
}

function statusLabel(item: InventoryItem) {
  if (item.status === "UNKNOWN") return "Stock N/A";
  if (item.status === "OUT_OF_STOCK") return "Out of stock";
  return `${item.stock} in stock`;
}

function statusColor(item: InventoryItem) {
  if (item.status === "UNKNOWN") return "text-zinc-400";
  if (item.status === "OUT_OF_STOCK") return "text-rose-500";
  return "text-emerald-500";
}

export function InventoryList({
  items,
  isLoading,
  error,
  onRetry,
  onSelectItem,
}: InventoryListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-2xl bg-[var(--background-secondary)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-rose-700">
          Could not load inventory
        </h3>
        <p className="text-xs text-rose-600">{error.message}</p>
        <Button
          onClick={onRetry}
          className="!w-auto mx-auto bg-rose-600 hover:bg-rose-700"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Inventory Stock
        </h1>
        <p className="text-xs text-zinc-400">
          Stock levels for every product in this store&apos;s catalog.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center py-20 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black mb-1">No Inventory Yet</h2>
          <p className="text-xs max-w-sm mx-auto text-zinc-400">
            Products added to this store will appear here with their stock
            levels.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card
              key={item.productId}
              className="p-5 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group cursor-pointer"
              style={{ borderColor: "var(--border-light)" }}
              onClick={() => onSelectItem(item.productId)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-black tracking-tight text-text-primary group-hover:text-brand-core transition-colors">
                    {item.name}
                  </h3>
                  {item.sku && (
                    <span className="text-[9px] font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider text-zinc-400 shrink-0">
                      {item.sku}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-3 mt-4 border-t text-[11px] font-semibold text-zinc-500"
                style={{ borderColor: "var(--border-light)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${statusColor(item)}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{statusLabel(item)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
