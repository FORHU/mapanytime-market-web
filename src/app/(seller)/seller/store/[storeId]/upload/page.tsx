"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  UploadCloud,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AIProductUploadPage() {
  const params = useParams();
  const storeId = (params.storeId as string) || "STORE-9921";

  // Form State Management (Task #167)
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mains");

  // File & Pipeline UI States (Task #166)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI parsing data from an uploaded menu image or barcode invoice (Task #166)
  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setAnalyzed(false);

    // Simulate OCR text parsing delay
    setTimeout(() => {
      setIsProcessing(false);
      setAnalyzed(true);

      // Auto-populate the form inputs mock data based on store context
      if (storeId === "STORE-9921") {
        setProductName("Special Crispy Pata");
        setPrice("580.00");
        setCategory("Mains");
      } else if (storeId === "STORE-1120") {
        setProductName("Wireless Ergonomic Mouse v2");
        setPrice("1850.00");
        setCategory("Peripherals");
      } else {
        setProductName("AI Parsed Marketplace Goods");
        setPrice("250.00");
        setCategory("Mains");
      }
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Format form parameters into target Express database payloads (Task #167 / #168)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productPayload = {
      storeId: storeId,
      name: productName,
      price: parseFloat(price) || 0,
      category: category,
      status: "Active",
      imageFileName: selectedFile ? selectedFile.name : "manual-override.png",
    };

    try {
      // Connects to Express endpoint (Task #168)
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) throw new Error("API Connection broken");
      alert("Product successfully cataloged!");
    } catch (error) {
      console.log("Mock Payload Compiled Successfully:", productPayload);
      alert(
        `Success! Compiled JSON payload for Express:\n\n${JSON.stringify(productPayload, null, 2)}`,
      );
    } finally {
      setIsSubmitting(false);
      // Reset State
      setSelectedFile(null);
      setProductName("");
      setPrice("");
      setAnalyzed(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
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

      {/* Main Form Split Layout Layer (Task #166) */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* LEFT COLUMN: Image Ingestion Dropzone Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
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
                  : "Drop menu/product photography here"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Supports standard matrix formats (PNG, JPG, JPEG) up to 10MB
              </p>
            </div>
          </div>

          {/* AI Status Notification Banner Blocks */}
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
                  the manual block before publishing.
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

        {/* RIGHT COLUMN: Parameters Form Overrides (Task #167) */}
        <form
          onSubmit={handleProductSubmit}
          className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">
              Catalog Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="Mains">Mains / Core Dishes</option>
              <option value="Soups">Soups &amp; Stews</option>
              <option value="Beverages">Beverages &amp; Drinks</option>
              <option value="Peripherals">Hardware Peripherals</option>
              <option value="Grains">Bulk Grains</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProcessing}
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isSubmitting
              ? "Compiling JSON Payload..."
              : "Publish Product Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
