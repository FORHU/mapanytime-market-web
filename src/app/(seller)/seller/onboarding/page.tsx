"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Store, FileText, Loader2 } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Store Configuration Attributes States
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [operatingHours, setOperatingHours] = useState("");

  // Branch Compliance Document File States
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
  const [mayorsPermitFile, setMayorsPermitFile] = useState<File | null>(null);
  const [dtiCertificateFile, setDtiCertificateFile] = useState<File | null>(
    null,
  );
  const [tinFile, setTinFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !governmentIdFile ||
      !mayorsPermitFile ||
      !dtiCertificateFile ||
      !tinFile
    ) {
      return alert(
        "Please upload all required compliance documents to proceed.",
      );
    }

    setIsSubmitting(true);

    // ── 📦 BUILD MULTIPART FORM-DATA ENVELOPE TO MATCH POSTMAN EXACTLY ──
    const formData = new FormData();

    // 1. Core Store Data Object Wrapper
    const storeData = {
      storeName: storeName.trim(),
      description: "Local Merchant Storefront Layout",
    };
    formData.append("storeData", JSON.stringify(storeData));

    // 2. Location Object Wrapper (Defaults assigned to prevent map rendering drops)
    const locationData = {
      currentAddress: storeLocation.trim(),
      homeAddress: storeLocation.trim(),
      city: "Baguio",
      province: "Benguet",
      zipCode: "2600",
      country: "PH",
      latitude: 16.4023,
      longitude: 120.596,
    };
    formData.append("locationData", JSON.stringify(locationData));

    // 3. Operating Hours Array Wrapper (Splits string values safely e.g., "7:00-6:00")
    const hourSplits = operatingHours.split("-");
    const hoursData = [
      {
        dayOfWeek: 1,
        openTime: hourSplits[0]?.trim() || "07:00",
        closeTime: hourSplits[1]?.trim() || "18:00",
        isClosed: false,
      },
    ];
    formData.append("hoursData", JSON.stringify(hoursData));

    // 4. File Fields Mapped Directly to Backend Keys
    formData.append("mayorsPermit", mayorsPermitFile);
    formData.append("tinId", tinFile); // 🟢 Matched to "tinId"
    formData.append("dtiCertificate", dtiCertificateFile); // 🟢 Matched to "dtiCertificate"
    formData.append("govId", governmentIdFile); // 🟢 Matched to "govId"

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://192.168.1.176:3002/api/v1/stores", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Route verification checks
        },
        body: formData, // Browser dynamically writes multi-part boundary string details
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to submit storefront application.",
        );
      }

      const dbData = await response.json();
      const newStoreId = dbData?.id || dbData?.data?.id || "STORE-DEV-MOCK";

      alert(
        "Onboarding transmitted successfully! Loading your merchant store layout workspace.",
      );
      router.push(`/seller/store`);
    } catch (error: any) {
      console.error("Onboarding transmission error:", error);
      alert(error.message || "Connection to the backend cluster failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center space-y-6 py-8 animate-in fade-in duration-300">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Application Under Review
            </h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Your store configuration and compliance files have been
              successfully transmitted.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all"
          >
            Return to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" /> Setup Your Store
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your initial store location branch and upload corporate
            verification fields.
          </p>
        </div>

        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Store / Branch Name"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Physical Store Address (e.g. Session Road, Baguio)"
              required
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Operating Hours (e.g. 07:00 - 22:00)"
              required
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-dashed border-slate-200 space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Required Compliance Documents
            </label>

            {[
              {
                id: "govId",
                label: "Government Issued ID",
                file: governmentIdFile,
                setFile: setGovernmentIdFile,
              },
              {
                id: "mayorsPermit",
                label: "Mayor's Permit Document",
                file: mayorsPermitFile,
                setFile: setMayorsPermitFile,
              },
              {
                id: "dtiCertificate",
                label: "DTI Certificate Submission",
                file: dtiCertificateFile,
                setFile: setDtiCertificateFile,
              },
              {
                id: "tinId",
                label: "TIN Card / Document",
                file: tinFile,
                setFile: setTinFile,
              },
            ].map((doc) => (
              <div
                key={doc.id}
                className="w-full bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {doc.file ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-mono truncate text-slate-600 max-w-[180px]">
                    {doc.file ? doc.file.name : `No ${doc.label} attached`}
                  </span>
                </div>
                <input
                  type="file"
                  id={`${doc.id}Input`}
                  accept=".jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && doc.setFile(e.target.files[0])
                  }
                />
                <label
                  htmlFor={`${doc.id}Input`}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  {doc.file ? "Replace" : "Upload"}
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Branch Configurations...</span>
              </>
            ) : (
              <span>Submit Storefront Profile</span>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
