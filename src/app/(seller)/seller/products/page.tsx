"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";

const initialProducts = [
  {
    id: 1,
    name: "Organic Mixed Vegetable Bundle",
    image: "🥗",
    category: "Fresh Produce",
    price: "₱12.50",
    stock: 24,
    sold: 84,
    status: "Active",
  },
  {
    id: 2,
    name: "Local Honey 500ml",
    image: "🍯",
    category: "Pantry",
    price: "₱14.00",
    stock: 12,
    sold: 61,
    status: "Active",
  },
  {
    id: 3,
    name: "Dragon Fruit Pack 1kg",
    image: "🐉",
    category: "Fresh Produce",
    price: "₱8.50",
    stock: 0,
    sold: 48,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Cassava Chips 200g",
    image: "🥔",
    category: "Snacks",
    price: "₱3.50",
    stock: 88,
    sold: 122,
    status: "Active",
  },
  {
    id: 5,
    name: "Fresh Coconut Water 1L",
    image: "🥥",
    category: "Beverages",
    price: "₱2.80",
    stock: 6,
    sold: 73,
    status: "Low Stock",
  },
];

export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Active", "Out of Stock", "Low Stock", "Pending"];

  const filteredProducts = initialProducts.filter(
    (p) => activeTab === "All" || p.status === activeTab,
  );

  return (
    <div className="space-y-6">
      {/* Header section matching your exact visual weight */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            {initialProducts.length} products · 3 active
          </p>
        </div>
        <Link
          href="/seller/upload"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product (AI)
        </Link>
      </div>

      {/* Tab bar + Search row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* The Core Inventory Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Sold</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/40 transition-colors group"
                >
                  <td className="py-3.5 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/40">
                      {product.image}
                    </div>
                    <span className="text-slate-900 font-bold text-xs tracking-tight">
                      {product.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {product.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-extrabold">
                    {product.price}
                  </td>
                  <td
                    className={`py-3.5 px-4 font-extrabold ${product.stock === 0 ? "text-rose-500" : product.stock <= 12 ? "text-amber-500" : "text-slate-800"}`}
                  >
                    {product.stock}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {product.sold}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        product.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : product.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
