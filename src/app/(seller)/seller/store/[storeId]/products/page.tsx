"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Edit3 } from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
} from "@/features/products/api/products.api";
import {
  Card,
  Badge,
  FormField,
  CustomButton,
  useNotification,
} from "@/shared/components";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "Active" | "Draft";
  sales: number;
}
const CATEGORIES = [
  { id: "mains", name: "Mains" },
  { id: "appetizers", name: "Appetizers" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
  { id: "supplies", name: "Supplies & Soils" },
];

export default function ProductManagementPage() {
  const params = useParams();
  const showNotification = useNotification();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbData = await getProducts(storeId);
      const productArray = Array.isArray(dbData)
        ? dbData
        : dbData?.data?.products || dbData?.products || [];
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Catalog fetch dropped.";
      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [storeId, showNotification]);

  useEffect(() => {
    if (storeId) fetchProducts();
  }, [storeId, fetchProducts]);

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
      showNotification(
        editingProduct ? "Product changes saved!" : "New product added!",
        "success",
      );
      fetchProducts();
      setIsModalOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save product.";
      showNotification(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [formState, setFormState] = useState({
    name: "",
    categoryId: "",
    price: "",
    status: "Active",
  });
  const isFormInvalid =
    formState.name.trim() === "" ||
    !formState.price ||
    parseFloat(formState.price) <= 0 ||
    formState.categoryId === "";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
        <CustomButton
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
        >
          Add New Product
        </CustomButton>
      </div>

      <Card
        variant="outlined"
        padding="none"
        className="!rounded-3xl overflow-hidden shadow-2xs"
      >
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
                  No products found. Click Add New Product above to begin.
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
                    <Badge
                      variant={p.status === "Active" ? "success" : "neutral"}
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        const foundCategory = CATEGORIES.find(
                          (c) =>
                            c.name.toLowerCase() === p.category.toLowerCase(),
                        );
                        setEditingProduct(p);
                        setFormState({
                          name: p.name,
                          categoryId: foundCategory ? foundCategory.id : "",
                          price: p.price.toString(),
                          status: p.status,
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-900 p-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

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
            </div>

            <div className="space-y-3">
              <FormField
                type="text"
                label="Product Title"
                placeholder="e.g. 1KG Organic Loam Soil"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700">
                  Catalog Category
                </label>
                <select
                  value={formState.categoryId}
                  onChange={(e) =>
                    setFormState({ ...formState, categoryId: e.target.value })
                  }
                  className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-50/50 cursor-pointer"
                  required
                >
                  <option value="" disabled hidden>
                    Select category option...
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                type="number"
                step="0.01"
                label="Retail Pricing Unit (PHP)"
                placeholder="0.00"
                value={formState.price}
                onChange={(e) =>
                  setFormState({ ...formState, price: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 text-slate-400 font-bold text-xs hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <CustomButton
                type="submit"
                loading={isSubmitting}
                disabled={isFormInvalid}
                className="bg-emerald-600 text-white font-bold text-xs"
              >
                <span>
                  {isSubmitting ? "Committing..." : "Commit Structure"}
                </span>
              </CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
