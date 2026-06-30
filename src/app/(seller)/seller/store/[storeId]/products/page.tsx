"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Search, Plus, Filter, Edit3, Trash2, X, Loader2 } from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
} from "@/features/products/api/products.api";

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
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    categoryId: "",
    price: "",
    status: "Active",
  });

  // Automatically clear notification layout alerts after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── 🔄 LIVE FETCH: GET STORE CATALOG (MEMOIZED TO RESOLVE HOISTING HOOK ERROR) ──
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbData = await getProducts(storeId);

      const productArray = Array.isArray(dbData)
        ? dbData
        : dbData?.data?.products || dbData?.products || dbData?.data || [];

      setProducts(
        productArray.map((item: any) => ({
          id: item.id || item._id,
          name: item.name,
          category: item.category?.name || "Unassigned Category",
          price: item.price,
          status: item.isActive ? "Active" : "Draft",
          sales: item.sales || 0,
        })),
      );
    } catch (error: any) {
      console.error("Fetch catalog exception trace:", error);
      setToast({
        message: error.message || "Catalog fetch dropped.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  // ── 🔄 STABLE LIVE EFFECT TRIGGERS AFTER REGISTRATION DECLARATION ──
  useEffect(() => {
    if (storeId) fetchProducts();
  }, [storeId, fetchProducts]);

  // ── 💾 LIVE MUTATION: POST/PATCH FORMS ──
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formState.name.trim(),
      price: parseFloat(formState.price) || 0,
      categoryId: formState.categoryId.trim(),
      storeId,
      isActive: formState.status === "Active",
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setToast({
        message: editingProduct
          ? "Product changes saved!"
          : "New product added to catalogue matrix!",
        type: "success",
      });

      fetchProducts();
      setIsModalOpen(false);
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-2xl shadow-xl text-xs font-black border z-50 transition-all animate-in slide-in-from-top-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store Environment Context ID:{" "}
            <span className="font-mono text-emerald-600 font-bold">
              {storeId}
            </span>
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormState({
              name: "",
              categoryId: "",
              price: "",
              status: "Active",
            });
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          Add New Product
        </button>
      </div>

      {/* Table Interface Viewport Layer */}
      <div className="bg-white border rounded-3xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700 font-bold">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading active store records ledger...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-slate-400 font-medium"
                >
                  No products found inside this store node context shell. Click
                  Add New Product above to begin.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  <td className="p-4 text-slate-900 font-extrabold">
                    {p.name}
                  </td>
                  <td className="p-4 text-slate-500">{p.category}</td>
                  <td className="p-4 font-mono text-slate-600">
                    ₱
                    {p.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] tracking-wide font-black ${
                        p.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setFormState({
                          name: p.name,
                          categoryId: "",
                          price: p.price.toString(),
                          status: p.status,
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-900 p-1.5 transition-colors cursor-pointer"
                      title="Edit item definitions"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Operation Action Drawer Modal Layer Form Container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl border animate-in zoom-in-95 duration-150"
          >
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                {editingProduct
                  ? "Edit Existing Product"
                  : "Launch New Catalog Entry"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ensure fields align cleanly to your target relational parent
                records.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 block">
                  Product Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1KG Organic Loam Soil"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 block">
                  Parent Category ID (UUID)
                </label>
                <input
                  type="text"
                  placeholder="Paste the category UUID key copied from your ledger"
                  value={formState.categoryId}
                  onChange={(e) =>
                    setFormState({ ...formState, categoryId: e.target.value })
                  }
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 block">
                  Retail Pricing Unit (PHP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formState.price}
                  onChange={(e) =>
                    setFormState({ ...formState, price: e.target.value })
                  }
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 block">
                  Display Visibility Status
                </label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState({ ...formState, status: e.target.value })
                  }
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Active">Active (Visible to Buyers)</option>
                  <option value="Draft">Draft (Hidden Layout Mode)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-dashed">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                {isSubmitting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>
                  {isSubmitting ? "Transmitting..." : "Commit Structure"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
