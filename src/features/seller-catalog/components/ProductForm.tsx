"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";

interface ProductFormData {
  name: string;
  price: string;
  sku: string;
  category: string;
  description: string;
  stock: number;
}

interface ProductFormProps {
  onSuccess?: (data: ProductFormData) => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    sku: "",
    category: "electronics",
    description: "",
    stock: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ⚡ Simulated Network Latency / API Call Pipeline
    setTimeout(() => {
      console.log("Product Submitted to Catalog State Machine:", formData);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess(formData);
      }

      // Reset Form State
      setFormData({
        name: "",
        price: "",
        sku: "",
        category: "electronics",
        description: "",
        stock: 0,
      });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400"
            style={{ borderColor: "var(--border-light)" }}
            placeholder="e.g., Wireless Mechanical Keyboard"
          />
        </div>

        {/* SKU Identity */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            SKU / Model Number
          </label>
          <input
            type="text"
            name="sku"
            required
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400"
            style={{ borderColor: "var(--border-light)" }}
            placeholder="e.g., KB-MECH-87"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pricing */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            required
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400"
            style={{ borderColor: "var(--border-light)" }}
            placeholder="0.00"
          />
        </div>

        {/* Stock Volume */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Initial Stock
          </label>
          <input
            type="number"
            name="stock"
            required
            min="0"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400"
            style={{ borderColor: "var(--border-light)" }}
            placeholder="0"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400"
            style={{ borderColor: "var(--border-light)" }}
          >
            <option value="electronics">Electronics</option>
            <option value="apparel">Apparel & Fashion</option>
            <option value="home">Home & Groceries</option>
            <option value="automotive">Automotive Accessories</option>
          </select>
        </div>
      </div>

      {/* Description Textarea */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Product Description
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
          style={{ borderColor: "var(--border-light)" }}
          placeholder="Describe your item details, dimensions, or localized availability markers..."
        />
      </div>

      {/* Form CTA Submission Trigger */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Processing Asset..." : "Register Catalog Product"}
        </button>
      </div>
    </form>
  );
}
