"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, Plus, Filter, Edit3, EyeOff, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "Active" | "Draft";
  sales: number;
}

export default function ProductManagementPage() {
  const params = useParams();
  const storeId = (params.storeId as string) || "STORE-9921";
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const mockDbProducts: Record<string, Product[]> = {
      "STORE-9921": [
        {
          id: "PROD-01",
          name: "Bulalo Family Size",
          category: "Soups",
          price: 450,
          status: "Active",
          sales: 84,
        },
        {
          id: "PROD-02",
          name: "Sizzling Sisig",
          category: "Sizzling",
          price: 220,
          status: "Active",
          sales: 61,
        },
        {
          id: "PROD-03",
          name: "Lechon Kawali",
          category: "Mains",
          price: 280,
          status: "Active",
          sales: 36,
        },
        {
          id: "PROD-04",
          name: "Pinakbet",
          category: "Vegetables",
          price: 150,
          status: "Draft",
          sales: 0,
        },
      ],
      "STORE-4401": [
        {
          id: "PROD-11",
          name: "Beachside Cocktail Pitcher",
          category: "Beverages",
          price: 650,
          status: "Active",
          sales: 130,
        },
        {
          id: "PROD-12",
          name: "Grilled Seafood Platter",
          category: "Mains",
          price: 1200,
          status: "Active",
          sales: 24,
        },
        {
          id: "PROD-13",
          name: "Crispy Calamari Basket",
          category: "Starters",
          price: 320,
          status: "Active",
          sales: 64,
        },
      ],
      "STORE-1120": [
        {
          id: "PROD-21",
          name: "Mechanical Gaming Keyboard",
          category: "Peripherals",
          price: 2450,
          status: "Active",
          sales: 4,
        },
        {
          id: "PROD-22",
          name: "Ergonomic Vertical Mouse",
          category: "Peripherals",
          price: 1500,
          status: "Active",
          sales: 9,
        },
        {
          id: "PROD-23",
          name: "RGB Desk Mat Extra Large",
          category: "Accessories",
          price: 600,
          status: "Active",
          sales: 12,
        },
      ],
      "STORE-8873": [
        {
          id: "PROD-31",
          name: "Premium Jasmine Rice 25kg",
          category: "Grains",
          price: 1450,
          status: "Active",
          sales: 10,
        },
        {
          id: "PROD-32",
          name: "Fresh Baguio Strawberries 1kg",
          category: "Produce",
          price: 350,
          status: "Active",
          sales: 24,
        },
        {
          id: "PROD-33",
          name: "Native Benguet Coffee Beans",
          category: "Beverages",
          price: 200,
          status: "Active",
          sales: 19,
        },
      ],
    };
    setProducts(mockDbProducts[storeId] || []);
  }, [storeId]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Edit product details, manage public visibility, and modify retail
            pricing structures.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all w-fit">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all">
          <Filter className="w-3.5 h-3.5" /> Filter Catalog
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Total Sold</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="text-slate-900 font-black tracking-tight block text-sm">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {product.id}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-semibold">
                    {product.category}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 font-mono text-sm">
                    ₱{product.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono">
                    {product.sales} units
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${product.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                        title={
                          product.status === "Active"
                            ? "Hide from Store"
                            : "Publish"
                        }
                      >
                        {product.status === "Active" ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
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
