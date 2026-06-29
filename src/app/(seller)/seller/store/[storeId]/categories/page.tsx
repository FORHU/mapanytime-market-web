"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, FolderPlus, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";

export default function CreateCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const dynamicStoreId = params.storeId as string;

  const [mounted, setMounted] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryPayload = {
      storeId: dynamicStoreId,
      name: categoryName.trim(),
      description: description.trim() || "No description provided.",
    };

    try {
      const secureToken = localStorage.getItem("token");

      // 💥 Connecting straight to your teammate's categories router endpoint
      const response = await fetch(
        "http://192.168.1.176:3002/api/v1/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secureToken}`,
          },
          body: JSON.stringify(categoryPayload),
        },
      );

      const dbData = await response.json();

      if (!response.ok) {
        throw new Error(
          dbData?.message ||
            `Category initialization failed with code: ${response.status}`,
        );
      }

      // Capture the generated relational primary key out of your success envelope response data map
      const generatedCategoryId =
        dbData?.id || dbData?.data?.id || "MOCK-CAT-ID";

      alert(
        `Category "${categoryName}" generated successfully!\nUUID Key Saved: ${generatedCategoryId}`,
      );

      // Clean up inputs
      setCategoryName("");
      setDescription("");
    } catch (err: any) {
      console.error("Category creation failure:", err);
      alert(
        `Category Registry Crash: ${err.message || "Endpoint cluster unreachable."}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-emerald-600" /> Create Product
            Category
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Initialize parent categories (e.g. Soil, Fertilizers, Pots) to
            unlock product loading layers.
          </p>
        </div>

        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Category Name (e.g., Loam Soil Types)"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <textarea
              placeholder="Category Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering parent index fields...</span>
              </>
            ) : (
              <>
                <span>Create Store Category</span>
                <Plus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-dashed border-slate-200 text-center">
          <button
            onClick={() =>
              router.push(`/seller/store/${dynamicStoreId}/products`)
            }
            className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <span>Proceed to Product Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
