"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Plus,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
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
  const storeId = (params.storeId as string) || "STORE-9921";

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);

  // Simulated multi-store database index for stock items
  useEffect(() => {
    const mockDbInventory: Record<string, InventoryItem[]> = {
      "STORE-9921": [
        {
          id: "INV-1001",
          sku: "LJR-BUL-FAM",
          name: "Bulalo Family Size",
          category: "Soups",
          price: 450,
          stock: 15,
          status: "In Stock",
        },
        {
          id: "INV-1002",
          sku: "LJR-SIS-REG",
          name: "Sizzling Sisig",
          category: "Sizzling",
          price: 220,
          stock: 4,
          status: "Low Stock",
        },
        {
          id: "INV-1003",
          sku: "LJR-LEK-KAW",
          name: "Lechon Kawali",
          category: "Mains",
          price: 280,
          stock: 22,
          status: "In Stock",
        },
        {
          id: "INV-1004",
          sku: "LJR-PIN-BET",
          name: "Pinakbet",
          category: "Vegetables",
          price: 150,
          stock: 0,
          status: "Out of Stock",
        },
      ],
      "STORE-4401": [
        {
          id: "INV-2001",
          sku: "SWC-COK-PIT",
          name: "Beachside Cocktail Pitcher",
          category: "Beverages",
          price: 650,
          stock: 40,
          status: "In Stock",
        },
        {
          id: "INV-2002",
          sku: "SWC-SEA-PLT",
          name: "Grilled Seafood Platter",
          category: "Mains",
          price: 1200,
          stock: 5,
          status: "Low Stock",
        },
        {
          id: "INV-2003",
          sku: "SWC-CAL-BSK",
          name: "Crispy Calamari Basket",
          category: "Starters",
          price: 320,
          stock: 18,
          status: "In Stock",
        },
      ],
      "STORE-1120": [
        {
          id: "INV-3001",
          sku: "CS-MCH-KEY",
          name: "Mechanical Gaming Keyboard",
          category: "Peripherals",
          price: 2450,
          stock: 8,
          status: "In Stock",
        },
        {
          id: "INV-3002",
          sku: "CS-ERG-MSE",
          name: "Ergonomic Vertical Mouse",
          category: "Peripherals",
          price: 1500,
          stock: 2,
          status: "Low Stock",
        },
        {
          id: "INV-3003",
          sku: "CS-RGB-MAT",
          name: "RGB Desk Mat Extra Large",
          category: "Accessories",
          price: 600,
          stock: 25,
          status: "In Stock",
        },
      ],
      "STORE-8873": [
        {
          id: "INV-4001",
          sku: "DG-JAS-RCE",
          name: "Premium Jasmine Rice 25kg",
          category: "Grains",
          price: 1450,
          stock: 45,
          status: "In Stock",
        },
        {
          id: "INV-4002",
          sku: "DG-BAG-STR",
          name: "Fresh Baguio Strawberries 1kg",
          category: "Produce",
          price: 350,
          stock: 0,
          status: "Out of Stock",
        },
        {
          id: "INV-4003",
          sku: "DG-BEN-COF",
          name: "Native Benguet Coffee Beans",
          category: "Beverages",
          price: 200,
          stock: 60,
          status: "In Stock",
        },
      ],
    };

    setItems(mockDbInventory[storeId] || []);
  }, [storeId]);

  // Compute stock counters dynamically
  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
  const outOfStockCount = items.filter(
    (i) => i.status === "Out of Stock",
  ).length;

  // Filter items matching the current text search query criteria
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── HEADER ACTIONS SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Stock Inventory
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Monitor stock thresholds, manage catalogs, and update SKU
            variations.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all w-fit">
          <Plus className="w-4 h-4" /> Add Inventory Item
        </button>
      </div>

      {/* ── STOCK METRICS OVERVIEW RIBBON ── */}
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

      {/* ── FILTER FILTER SEARCH PANEL LAYER ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, or item SKU..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
        </div>
      </div>

      {/* ── INVENTORY CONTROL MATRIX DATA TABLE ── */}
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
              {filteredItems.map((item) => (
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
                      <button
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                        title="Edit Item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs font-bold text-slate-400 italic bg-white">
            No matching inventory records found for this branch selection.
          </div>
        )}
      </div>
    </div>
  );
}
