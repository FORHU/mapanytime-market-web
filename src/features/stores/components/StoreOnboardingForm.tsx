"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Store, UploadCloud, CheckCircle2 } from "lucide-react";
import { MapSelection } from "./MapSelection";
import { Button } from "@/shared/components/ui/Button";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import { submitOnboarding } from "../api/onboarding.client";

type DocumentField = "govIdKey" | "mayorsPermitKey" | "dtiKey" | "tinKey";

export default function StoreOnboardingForm({
  onComplete,
}: {
  onComplete: (storeId: string) => void;
}) {
  const [formData, setFormData] = useState({
    storeName: "",
    storeHours: "08:00 AM - 09:00 PM",
    parentCategory: "retail",
    lat: 16.4164,
    lng: 120.5931,
    govIdKey: "",
    mayorsPermitKey: "",
    dtiKey: "",
    tinKey: "",
  });

  const [isDone, setIsDone] = useState(false);

  // One mutation instance per document slot — useS3AssetUpload already owns
  // its own onSuccess/onError (with toasts), so each upload's error handling
  // lives in one place instead of being re-implemented per form.
  const govIdUpload = useS3AssetUpload();
  const mayorsPermitUpload = useS3AssetUpload();
  const dtiUpload = useS3AssetUpload();
  const tinUpload = useS3AssetUpload();

  const uploadsByField: Record<DocumentField, typeof govIdUpload> = {
    govIdKey: govIdUpload,
    mayorsPermitKey: mayorsPermitUpload,
    dtiKey: dtiUpload,
    tinKey: tinUpload,
  };
  // Derived from the mutations themselves rather than a separate piece of
  // state, so "which upload is in flight" can never drift out of sync with
  // what's actually pending.
  const uploadingField = (Object.keys(uploadsByField) as DocumentField[]).find(
    (field) => uploadsByField[field].isPending,
  );

  const onboardMutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: (data) => {
      setIsDone(true);
      // Give the confirmation card a moment on screen before routing away.
      setTimeout(() => onComplete(data.storeId), 1500);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not submit onboarding data. Please try again.",
      );
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: DocumentField,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadsByField[fieldName].mutate(file, {
      onSuccess: (data) =>
        setFormData((prev) => ({ ...prev, [fieldName]: data.fileKey })),
    });
  };

  const handleOnboardSubmit = (e: FormEvent) => {
    e.preventDefault();
    onboardMutation.mutate(formData);
  };

  if (isDone) {
    return (
      <Card className="max-w-xl mx-auto p-8 text-center space-y-4 py-16">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-lg font-black">Merchant Onboarding Verified!</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Your documentation matrix, secure S3 asset pointers, and spatial node
          configurations are locked.
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
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-colors"
            style={{ backgroundColor: "var(--brand-dark)" }}
          >
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black">Merchant Store Onboarding</h2>
            <p className="text-[11px] text-zinc-400">
              Establish storefront settings and upload secure registry data
              vectors
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
                className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
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
                className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Taxonomy */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Store Type Category
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)] cursor-pointer"
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

            {/* Map Selection Frame */}
            <div className="sm:col-span-2 pt-2">
              <MapSelection
                initialLat={formData.lat}
                initialLng={formData.lng}
                onChange={handleLocationChange}
              />
            </div>
          </div>

          {/* SECURE FILE UPLOAD MATRIX */}
          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <h3 className="text-xs font-black tracking-tight mb-4 text-[var(--text-secondary)] uppercase">
              Compliance Verification Documents
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Government ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Government-Issued ID
                </label>
                <div
                  className="relative flex items-center justify-center border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <input
                    type="file"
                    required={!formData.govIdKey}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "govIdKey")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={Boolean(uploadingField)}
                  />
                  <div className="text-center text-[11px] text-zinc-500 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-zinc-400" />
                    <span>
                      {uploadingField === "govIdKey"
                        ? "Streaming..."
                        : formData.govIdKey
                          ? "✓ ID Attached"
                          : "Select ID PDF/Img"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mayor's Business Permit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Mayor&apos;s Business Permit
                </label>
                <div
                  className="relative flex items-center justify-center border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <input
                    type="file"
                    required={!formData.mayorsPermitKey}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "mayorsPermitKey")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={Boolean(uploadingField)}
                  />
                  <div className="text-center text-[11px] text-zinc-500 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-zinc-400" />
                    <span>
                      {uploadingField === "mayorsPermitKey"
                        ? "Streaming..."
                        : formData.mayorsPermitKey
                          ? "✓ Permit Attached"
                          : "Select Permit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* DTI Certificate */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  DTI Registration Certificate
                </label>
                <div
                  className="relative flex items-center justify-center border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <input
                    type="file"
                    required={!formData.dtiKey}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "dtiKey")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={Boolean(uploadingField)}
                  />
                  <div className="text-center text-[11px] text-zinc-500 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-zinc-400" />
                    <span>
                      {uploadingField === "dtiKey"
                        ? "Streaming..."
                        : formData.dtiKey
                          ? "✓ DTI Attached"
                          : "Select Certificate"}
                    </span>
                  </div>
                </div>
              </div>

              {/* TIN Certification */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  TIN Certification (BIR 2303)
                </label>
                <div
                  className="relative flex items-center justify-center border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <input
                    type="file"
                    required={!formData.tinKey}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "tinKey")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={Boolean(uploadingField)}
                  />
                  <div className="text-center text-[11px] text-zinc-500 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-zinc-400" />
                    <span>
                      {uploadingField === "tinKey"
                        ? "Streaming..."
                        : formData.tinKey
                          ? "✓ BIR 2303 Attached"
                          : "Select Document"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={Boolean(uploadingField) || onboardMutation.isPending}
            isLoading={onboardMutation.isPending}
            className="!h-11 mt-4 text-xs font-bold rounded-xl"
          >
            {onboardMutation.isPending
              ? "Submitting..."
              : "Submit Store Onboarding Data"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
