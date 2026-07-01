"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Store, FileText, CheckCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import { createStore } from "@/features/seller/api/stores.api";
import {
  CustomButton,
  StorePickerMap,
  FormField,
  useNotification,
} from "@/shared/components";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const showNotification = useNotification();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States Matrix
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [storeType, setStoreType] = useState("");
  const [latitude, setLatitude] = useState<number>(16.4023);
  const [longitude, setLongitude] = useState<number>(120.596);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocationChange = useCallback(
    (lat: number, lng: number, address: string) => {
      setLatitude(lat);
      setLongitude(lng);
      setStoreAddress(address);
    },
    [],
  );

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeAddress.trim()) {
      showNotification(
        "Please select a physical store location on the map.",
        "warning",
      );
      return;
    }

    setLoading(true);
    try {
      // Construct a true FormData instance matching your API declaration parameters
      const storePayload = new FormData();
      storePayload.append("name", storeName);
      storePayload.append("address", storeAddress);
      storePayload.append("hours", operatingHours);
      storePayload.append("type", storeType);
      storePayload.append("lat", String(latitude));
      storePayload.append("lng", String(longitude));

      await createStore(storePayload);

      sessionStorage.setItem(
        "latest_onboarded_store",
        JSON.stringify({
          name: storeName,
          address: storeAddress,
          id: "TEMP-SESSION-ID",
        }),
      );

      showNotification(
        "Store profile registered successfully! Opening dashboard.",
        "success",
      );

      setTimeout(() => {
        router.push("/seller/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showNotification(
        `Onboarding Core Error: ${err.message || "Failed to create store."}`,
        "error",
      );
    } finally {
      // 🟢 FIXED: Changed 'bits:' typo back into a standard 'finally:' framework block
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const complianceDocs = [
    { id: "id", label: "Government Issued ID attached directly" },
    { id: "permit", label: "Mayor's Permit Document attachment" },
    { id: "dti", label: "DTI Certificate Submission block" },
    { id: "tin", label: "TIN Card / Document verification data" },
  ];

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-200">
        <div>
          <div className="inline-flex p-2 bg-emerald-50 text-emerald-600 rounded-lg mb-2">
            <Store className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Set Up Your Merchant Store
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your digital storefront perimeter map metrics to begin
            accepting localized buyer inquiries.
          </p>
        </div>

        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
          <FormField
            type="text"
            label="Store / Branch Name"
            placeholder="e.g. Baguio Fresh Organic Hub"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />

          <div className="space-y-1.5 w-full text-left">
            <label className="text-xs font-bold text-slate-700 tracking-tight">
              VISUAL LOCATION PIN SELECTOR
            </label>
            <StorePickerMap
              searchAddress={storeAddress}
              currentLat={latitude}
              currentLng={longitude}
              onLocationSelect={handleLocationChange}
            />
          </div>

          <FormField
            type="text"
            label="Physical Store Address"
            placeholder="e.g. Session Road, Baguio"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            required
          />

          <FormField
            type="text"
            label="Operating Hours"
            placeholder="e.g. 07:00 - 22:00"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            required
          />

          <FormField
            type="text"
            label="Store Type"
            placeholder="e.g. Louie's Sari Sari Store"
            value={storeType}
            onChange={(e) => setStoreType(e.target.value)}
            required
          />

          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Required Compliance Document Uploads
            </label>
            <div className="space-y-2">
              {complianceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-600 truncate">
                      No {doc.label}...
                    </span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2 text-[11px] text-slate-500 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              Coordinates tracked precisely at:{" "}
              <span className="font-mono font-bold text-slate-700">
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </span>
            </p>
          </div>

          <CustomButton
            type="submit"
            loading={loading}
            fullWidth
            className="!bg-emerald-600 hover:!bg-emerald-700 text-white py-3.5 mt-2"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Submit Storefront Profile
          </CustomButton>
        </form>
      </div>
    </AuthLayout>
  );
}
