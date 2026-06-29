"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
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

  const fetchLiveWarehouseLedger = async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Hit her exact verified schema route passing the dynamic parameter filter
      const response = await fetch(
        `http://localhost:3002/api/v1/products?storeId=${storeId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Inventory drop rejected.");
      const dbData = await response.json();
      const productArray = Array.isArray(dbData)
        ? dbData
        : dbData.products || [];

      // Normalization block mapping raw data schemas into standard UI states
      setItems(
        productArray.map((item: any) => ({
          id: item.id || item._id,
          sku: item.sku || `SKU-${item.name?.substring(0, 3).toUpperCase()}`,
          name: item.name,
          category: item.category?.name || "General Menu",
          price: item.price,
          stock: item.stock ?? 10,
          status:
            item.stock === 0
              ? "Out of Stock"
              : item.stock <= 5
                ? "Low Stock"
                : "In Stock",
        })),
      );
    } catch (error) {
      console.error("Live inventory sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWarehouseLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Stock Inventory
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Monitor stock thresholds, manage catalogs, and track SKU variations.
          </p>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
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
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
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
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
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
        </div>
      </div>

      {/* Query Control Board */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, or item SKU..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            // 🟢 FIXED: Pass the function reference directly instead of an arrow function wrapper
            onClick={fetchLiveWarehouseLedger}
            className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Sync Data
          </button>
        </div>
      </div>

      {/* Main Grid View Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
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
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${
                          item.status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : item.status === "Low Stock"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600">
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
      </div>
    </div>
  );
}
