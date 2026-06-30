"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createProduct } from "@/features/products/api/products.api";
import {
  Sparkles,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AIProductUploadPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  // Form State Management
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mains");

  // File & Pipeline UI States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI parsing data from an uploaded menu image or photography
  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setAnalyzed(false);

    // Simulate OCR text parsing delay
    setTimeout(() => {
      setIsProcessing(false);
      setAnalyzed(true);

      // Auto-populate the form inputs mock data based on store context during testing
      setProductName("Special Crispy Pata");
      setPrice("580.00");
      setCategory("Mains");
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Format form parameters into target backend payloads
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productPayload = {
      storeId: storeId,
      categoryId: category,
      name: productName.trim(),
      price: parseFloat(price) || 0,
      isActive: true,
    };

    try {
      await createProduct(productPayload);
      alert("Product successfully cataloged!");

      // Reset State
      setSelectedFile(null);
      setProductName("");
      setPrice("");
      setAnalyzed(false);
    } catch (error) {
      console.error("Transmission Failure:", error);
      alert("Failed to sync listing with the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300 p-6">
      {/* Page Branding Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight inline-flex items-center gap-2">
          AI Product Upload{" "}
          <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Drop restaurant menus, item photos, or invoices. The system
          automatically parses catalog text fields.
        </p>
      </div>

      {/* Main Form Split Layout Layer */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* LEFT COLUMN: Image Ingestion Dropzone Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
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
                Supports standard formats (PNG, JPG, JPEG) up to 10MB
              </p>
            </div>
          </div>

          {/* Status Notifications */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-xs font-bold text-blue-800 animate-pulse">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
              <p>
                Vision OCR scanning executing image array payload parsing...
              </p>
            </div>
          )}

          {analyzed && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-xs font-bold text-emerald-800 animate-in fade-in duration-300">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p>OCR Text Extraction Complete</p>
                <p className="text-[10px] text-emerald-600 font-normal mt-0.5">
                  Parameters extracted with high confidence. Inspect fields in
                  the manual attributes panel before publishing.
                </p>
              </div>
            </div>
          )}

          {!selectedFile && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-400 italic">
              <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
              Awaiting image file attachments to trigger auto-fill pipeline
              overrides.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Parameters Form Overrides */}
        <form
          onSubmit={handleProductSubmit}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
        >
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Product Attributes Panel
          </h3>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">
              Product Title
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Organic Veg Bundle"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">
              Retail Unit Price (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">
              Catalog Category UUID
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Paste category layout ID from Swagger"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProcessing}
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            {isSubmitting ? "Publishing Listing..." : "Publish Product Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
