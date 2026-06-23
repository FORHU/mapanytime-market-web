"use client";

import { useState } from "react";
import { Upload, CheckCircle2, HelpCircle } from "lucide-react";

export default function AIProductUploadPage() {
  const stepper = [
    { label: "Upload Photo", active: true },
    { label: "AI Reads Product", active: false },
    { label: "Review & Price", active: false },
    { label: "Live on Map", active: false },
  ];

  // Manual configuration form states
  const [productTitle, setProductTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          AI Product Upload / Product Upload
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Snap a photo or key in information details manually below.
        </p>
      </div>

      {/* Stepper Tracking Ribbon */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 bg-white border border-slate-200/60 px-5 py-3 rounded-2xl w-fit shadow-xs">
        {stepper.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-bold">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border font-black ${
                step.active
                  ? "bg-slate-950 text-white border-slate-950"
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              {i + 1}
            </div>
            <span className={step.active ? "text-slate-900" : "text-slate-400"}>
              {step.label}
            </span>
            {i < stepper.length - 1 && (
              <div className="w-6 h-px bg-slate-200 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Main Container Grid Split */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* LEFT COLUMN SPLIT: Interactive Dropzone + Manual Form Inputs Block */}
        <div className="lg:col-span-3 space-y-6">
          {/* Dropzone Photo Slot */}
          <div className="border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50/50 transition-colors rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Drop your product photo here
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                or click to browse · JPG, PNG, HEIC
              </p>
            </div>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors">
              Choose Photo
            </button>
          </div>

          {/* Manual Input Fields Card Component */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-2">
              Product Details
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Product Title Field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g., Fresh Organic Mixed Vegetables"
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-semibold"
                />
              </div>

              {/* Category Dropdown Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-500 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-semibold"
                >
                  <option value="">Select a category</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Price (USD)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="$0.00"
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-mono font-bold"
                />
              </div>

              {/* Stock Quantity Counter Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Initial Stock Counter
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-mono font-bold"
                />
              </div>

              {/* Description Block field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers about your item sourcing, packaging limits, or expiration alerts..."
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-medium leading-relaxed resize-none"
                />
              </div>
            </div>

            <button className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2">
              Save and Publish Item Layout
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN SPLIT: Feature Breakdown Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-xs">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            What AI Will Do
          </h4>

          <div className="space-y-4">
            {[
              {
                title: "Background Removal",
                desc: "Auto-removes distracting real-world backgrounds instantly.",
              },
              {
                title: "OCR Text Extraction",
                desc: "Reads exact brand packaging contents, weights, and naming keys.",
              },
              {
                title: "Description Generation",
                desc: "Crafts premium localized sales narratives automatically.",
              },
              {
                title: "Category Detection",
                desc: "Auto-tags and organizes structures into marketplace catalog hierarchies.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3 items-start text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">{feature.title}</h5>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-800 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 shadow-xs">
            Use Sample Image (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
