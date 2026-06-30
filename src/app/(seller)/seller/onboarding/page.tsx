"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Loader2, FileText, CheckCircle } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";
import StorePickerMap from "@/shared/components/StorePickerMap";
import { createStore } from "@/features/seller/api/stores.api";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store Configuration Attributes States
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");

  // 🟢 FIXED: Extracted cleanly from the string into standalone operational states
  const [latitude, setLatitude] = useState<number>(16.4023);
  const [longitude, setLongitude] = useState<number>(120.596);

  const [operatingHours, setOperatingHours] = useState("");

  // Compliance Document States (Must be explicitly filled by the user)
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
  const [mayorsPermitFile, setMayorsPermitFile] = useState<File | null>(null);
  const [dtiCertificateFile, setDtiCertificateFile] = useState<File | null>(
    null,
  );
  const [tinFile, setTinFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🟢 Location Callback to receive draggable values from Mapbox canvas
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setStoreLocation(address);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── 🔒 STRICT FILE VERIFICATION GATEWAY ──
    if (
      !governmentIdFile ||
      !mayorsPermitFile ||
      !dtiCertificateFile ||
      !tinFile
    ) {
      alert(
        "❌ Submission Blocked: Please upload all required compliance documents to proceed.",
      );
      return;
    }

    setIsSubmitting(true);

    // ── 📦 RE-ASSEMBLE MULTIPART FORM-DATA FOR THE BACKEND MULTER KEYS ──
    const formData = new FormData();

    // 1. Core Store Data Object
    const storeData = {
      storeName: storeName.trim(),
      description: "Local Merchant Storefront Layout",
    };
    formData.append("storeData", JSON.stringify(storeData));

    // 2. Location Context Mapping
    const locationData = {
      currentAddress: storeLocation.trim(),
      homeAddress: storeLocation.trim(),
      city: "Baguio",
      province: "Benguet",
      zipCode: "2600",
      country: "PH",
      latitude: latitude, // 🟢 LIVE COORDINATE STATE INPUTS
      longitude: longitude, // 🟢 LIVE COORDINATE STATE INPUTS
    };
    formData.append("locationData", JSON.stringify(locationData));

    // 3. Operating Time Schedule Array Mapping
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

    // 4. Append the verified user files straight to the form map
    formData.append("mayorsPermit", mayorsPermitFile);
    formData.append("tinId", tinFile);
    formData.append("dtiCertificate", dtiCertificateFile);
    formData.append("govId", governmentIdFile);

    try {
      // Toggle to false when your partner deploys the root GET handler in store.route.ts
      const isSandboxTestingMode = false;
      const computedMockId =
        "store_" + Math.random().toString(36).substring(2, 9);

      if (isSandboxTestingMode) {
        // Cache data payload locally so your dashboard fallback reads it immediately
        const mockStoreCache = {
          id: computedMockId,
          name: storeName.trim(),
          location: storeLocation.trim(),
        };
        localStorage.setItem(
          "latest_onboarded_store",
          JSON.stringify(mockStoreCache),
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
      } else {
        await createStore(formData);
      }

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

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" /> Setup Your Store
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your store profile details. All compliance uploads are
            strictly required.
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
            />

            <input
              type="text"
              placeholder="Physical Store Address (e.g. Session Road, Baguio)"
              required
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
            />

            {/* 🟢 NEW: Integrated interactive map element block to update spatial states dynamically */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Visual Location Pin Selector
              </label>
              <StorePickerMap
                onLocationSelect={handleLocationSelect}
                searchAddress={storeLocation}
              />
            </div>

            <input
              type="text"
              placeholder="Operating Hours (e.g. 07:00 - 22:00)"
              required
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-dashed border-slate-200 space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Required Compliance Document Uploads
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
                <span>Verifying Form Requirements...</span>
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
