"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getProducts } from "@/features/products/api/products.api";
import { Card, Badge } from "@/shared/components";
import {
  Search,
  AlertTriangle,
  Package,
  RefreshCw,
  Edit3,
  Trash2,
} from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export default function InventoryPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 FIXED: Wrapped method execution footprint inside a memoized callback instance
  const fetchLiveWarehouseLedger = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const dbData = await getProducts(storeId);
      const productArray = Array.isArray(dbData)
        ? dbData
        : dbData.products || [];

      setItems(
        productArray.map((item: any) => {
          const status =
            item.stock === 0
              ? "Out of Stock"
              : item.stock <= 5
                ? "Low Stock"
                : "In Stock";
          return {
            id: item.id || item._id,
            sku: item.sku || `SKU-${item.name?.substring(0, 3).toUpperCase()}`,
            name: item.name,
            category: item.category?.name || "General Menu",
            price: item.price,
            stock: item.stock ?? 10,
            status,
          };
        }),
      );
    } catch (error) {
      console.error("Live inventory sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  // 🟢 FIXED: Included dependency token safely to prevent re-render loops
  useEffect(() => {
    fetchLiveWarehouseLedger();
  }, [fetchLiveWarehouseLedger]);

  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
  const outOfStockCount = items.filter(
    (i) => i.status === "Out of Stock",
  ).length;

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Stock Inventory
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Monitor stock thresholds, manage catalogs, and track SKU variations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          variant="outlined"
          padding="sm"
          className="!rounded-2xl flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {totalItems}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Total Unique SKUs
            </p>
          </div>
        </Card>
        <Card
          variant="outlined"
          padding="sm"
          className="!rounded-2xl flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {lowStockCount}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Low Stock Warnings
            </p>
          </div>
        </Card>
        <Card
          variant="outlined"
          padding="sm"
          className="!rounded-2xl flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {outOfStockCount}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Out of Stock Items
            </p>
          </div>
        </Card>
      </div>

      <Card
        variant="outlined"
        padding="sm"
        className="!rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between"
      >
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, or item SKU..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={fetchLiveWarehouseLedger}
          className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />{" "}
          Sync Data
        </button>
      </Card>

      <Card
        variant="outlined"
        padding="none"
        className="!rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Product Details</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Retail Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Querying warehousing tables over cluster context...
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-slate-900 font-black tracking-tight block text-sm">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {item.id}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600 text-xs">
                      {item.sku}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      {item.category}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 font-mono text-sm">
                      ₱{item.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700">
                      {item.stock} units
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          item.status === "In Stock"
                            ? "success"
                            : item.status === "Low Stock"
                              ? "warning"
                              : "error"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
