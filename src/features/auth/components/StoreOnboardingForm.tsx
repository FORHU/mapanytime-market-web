"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Store, FileText, CheckCircle2 } from "lucide-react";

export default function StoreOnboardingForm({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    storeName: "",
    storeHours: "08:00 AM - 09:00 PM",
    parentCategory: "retail",
    coordinates: "16.4164° N, 120.5931° E", // Default Baguio Central Point
    govId: "",
    mayorsPermit: "",
    dti: "",
    tinNumber: "",
  });

  const [isDone, setIsDone] = useState(false);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnboardSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsDone(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (isDone) {
    return (
      <Card className="max-w-xl mx-auto p-8 text-center space-y-4 py-16">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-lg font-black">Merchant Onboarding Verified!</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Your documentation matrix, store tracking maps, and taxonomy hooks are
          saved. Mapping out your administrative workspace panel now...
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 text-left">
      <Card className="p-6">
        <div
          className="mb-6 flex items-center gap-3 pb-4 border-b"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black">Merchant Store Onboarding</h2>
            <p className="text-[11px] text-zinc-400">
              Establish localized storefront settings and legal data vectors
            </p>
          </div>
        </div>

        <form onSubmit={handleOnboardSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                required
                placeholder="e.g., Baguio Hyperlocal Traders"
                value={formData.storeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>

            {/* Store Hours */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Operating Hours
              </label>
              <input
                type="text"
                name="storeHours"
                required
                value={formData.storeHours}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Taxonomy */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                General Store Type Category
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                style={{ borderColor: "var(--border-light)" }}
              >
                <option value="retail">
                  Retail Enterprise (Parent General)
                </option>
                <option value="food_beverage">Food & Beverage Specialty</option>
                <option value="groceries">Fresh Produce & Groceries</option>
                <option value="pharmacy">Medical Health & Pharmacy</option>
              </select>
            </div>

            {/* Mapbox Regional Node Localization */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Mapbox Geo-Lock Node
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="coordinates"
                  readOnly
                  value={formData.coordinates}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed select-none text-zinc-400 focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
                <span className="absolute right-3 top-2 text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase">
                  Baguio City Only
                </span>
              </div>
            </div>
          </div>

          {/* DOCUMENT EXTRACTION SUITE */}
          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <h3 className="text-xs font-black tracking-tight mb-3 flex items-center gap-1.5 text-zinc-500">
              <FileText className="w-3.5 h-3.5" /> Compliance & Governance
              Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Government-Issued ID
                </label>
                <input
                  type="text"
                  name="govId"
                  required
                  placeholder="UMID / SSS / Passport Reference"
                  value={formData.govId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {"Mayor's Business Permit Number"}
                </label>
                <input
                  type="text"
                  name="mayorsPermit"
                  required
                  placeholder="Permit No. 2026-XXXX"
                  value={formData.mayorsPermit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  DTI Certificate Registration ID
                </label>
                <input
                  type="text"
                  name="dti"
                  required
                  placeholder="DTI-TR-XXXXXX"
                  value={formData.dti}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  TIN Number (Tax Registry ID)
                </label>
                <input
                  type="text"
                  name="tinNumber"
                  required
                  placeholder="000-000-000-000"
                  value={formData.tinNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Submit Store Onboarding Data
          </button>
        </form>
      </Card>
    </div>
  );
}
