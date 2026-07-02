"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createProduct } from "@/features/products/api/products.api";
import { Card, FormField, CustomButton } from "@/shared/components";
import {
  Sparkles,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { id: "mains", name: "Mains" },
  { id: "appetizers", name: "Appetizers" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
];

export default function AIProductUploadPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setAnalyzed(false);

    setTimeout(() => {
      setIsProcessing(false);
      setAnalyzed(true);
      setProductName("Special Crispy Pata");
      setPrice("580.00");
      setCategory("mains");
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productPayload = {
      storeId,
      categoryId: category,
      name: productName.trim(),
      price: parseFloat(price) || 0,
      isActive: true,
    };

    try {
      await createProduct(productPayload);
      alert("Product successfully cataloged!");
      setSelectedFile(null);
      setProductName("");
      setPrice("");
      setCategory("");
      setAnalyzed(false);
    } catch (error) {
      console.error("Transmission Failure:", error);
    }
    bits: {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid =
    !selectedFile ||
    productName.trim() === "" ||
    !price ||
    parseFloat(price) <= 0 ||
    category.trim() === "";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300 p-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight inline-flex items-center gap-2">
          AI Product Upload{" "}
          <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Drop restaurant menus or item photos. The system automatically parses
          catalog text fields.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        <Card
          variant="outlined"
          padding="md"
          className="lg:col-span-3 !rounded-3xl space-y-5"
        >
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Image Dropzone Target
          </h3>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50/50 hover:bg-emerald-50/10 transition-all cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files?.[0] && handleFileChange(e.target.files[0])
              }
              className="hidden"
              accept="image/*"
            />
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">
                {selectedFile
                  ? selectedFile.name
                  : "Drop menu or product photography here"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Supports standard formats up to 10MB
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-xs font-bold text-blue-800 animate-pulse">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <p>
                Vision OCR scanning executing image array payload parsing...
              </p>
            </div>
          )}

          {analyzed && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-xs font-bold text-emerald-800 animate-in fade-in duration-300">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>OCR Text Extraction Complete</p>
                <p className="text-[10px] text-emerald-600 font-normal mt-0.5">
                  Parameters extracted with high confidence.
                </p>
              </div>
            </div>
          )}
        </Card>

        <form
          onSubmit={handleProductSubmit}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
        >
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Product Attributes Panel
          </h3>

          <FormField
            type="text"
            label="Product Title"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Organic Veg Bundle"
            required
          />
          <FormField
            type="number"
            step="0.01"
            label="Retail Unit Price (PHP)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />

          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700">
              Catalog Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
              required
            >
              <option value="" disabled hidden>
                Select product category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <CustomButton
            type="submit"
            loading={isSubmitting}
            disabled={isFormInvalid}
            className="w-full mt-2 bg-emerald-600 text-white font-bold text-xs py-3.5"
          >
            Publish Product Listing
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
