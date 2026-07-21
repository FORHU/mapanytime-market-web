"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { Boxes, Tag, Layers, ArrowLeft } from "lucide-react";
import type { InventoryItem } from "../contracts/inventory.contract";

interface InventoryDetailProps {
  item: InventoryItem;
  onBack: () => void;
}

function statusText(item: InventoryItem) {
  if (item.status === "UNKNOWN") return "Not tracked on this resource";
  if (item.status === "OUT_OF_STOCK") return "Out of stock";
  return `${item.stock} units available`;
}

function statusColor(item: InventoryItem) {
  if (item.status === "UNKNOWN") return "text-zinc-400";
  if (item.status === "OUT_OF_STOCK") return "text-rose-500";
  return "text-emerald-500";
}

export function InventoryDetail({ item, onBack }: InventoryDetailProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 text-left">
      <button
        onClick={onBack}
        className="text-xs font-bold underline text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
      >
        <ArrowLeft className="w-3 h-3" /> Back to Inventory
      </button>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-light)]">
          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[var(--brand-core)]">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)]">
              {item.name}
            </h2>
            <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-0.5">
              {item.productId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> SKU
            </span>
            <p className="font-medium text-[var(--text-primary)]">
              {item.sku ?? "Not available"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Price
            </span>
            <p className="font-medium text-[var(--text-primary)]">
              ${item.price.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Stock
            </span>
            <p className={`font-medium ${statusColor(item)}`}>
              {statusText(item)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
