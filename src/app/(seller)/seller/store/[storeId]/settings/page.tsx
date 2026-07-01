"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getSettings,
  updateSettings,
} from "@/features/seller/api/settings.api";
import { Card, Snackbar } from "@/shared/components";
import {
  Bell,
  Zap,
  MapPin,
  CreditCard,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AlertColor } from "@mui/material";

export default function SettingsPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    reviews: true,
    promotional: false,
  });
  const [aiSettings, setAiSettings] = useState({
    autoPublish: false,
    removeBg: true,
    ocrDetection: true,
    priceSuggestions: false,
  });
  const [mapVisibility, setMapVisibility] = useState({
    showStore: true,
    livePins: true,
    enableDiscovery: true,
    showHours: true,
  });

  useEffect(() => {
    if (!storeId) return;
    const fetchStorePreferences = async () => {
      setIsLoading(true);
      try {
        const dbData = await getSettings(storeId);
        const config = dbData?.data || dbData;
        if (config.notifications) setNotifications(config.notifications);
        if (config.aiSettings) setAiSettings(config.aiSettings);
        if (config.mapVisibility) setMapVisibility(config.mapVisibility);
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
      bits: {
        setIsLoading(false);
      }
    };
    fetchStorePreferences();
  }, [storeId]);

  const updatePreferenceMutation = async (
    section: string,
    updatedPayload: object,
  ) => {
    try {
      await updateSettings(storeId, section, updatedPayload);
      setToast({
        open: true,
        message: "Preferences synchronized instantly!",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Failed to sync configurations.",
        severity: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xs font-bold text-slate-400 gap-2 bg-[#FAFAFA]">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span>Parsing merchant preferences catalog...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-sans antialiased text-[#111111] animate-in fade-in duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Settings
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your preferences across branch:{" "}
            <span className="font-mono text-emerald-600">{storeId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            variant="outlined"
            padding="md"
            className="!rounded-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFF7ED] text-[#F97316] rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Notifications
              </h2>
            </div>
            <div className="space-y-4 pt-2">
              {[
                { key: "newOrders", label: "New order alerts" },
                { key: "lowStock", label: "Low stock warnings" },
                { key: "reviews", label: "Customer reviews" },
                { key: "promotional", label: "Promotional updates" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#334155] font-medium">
                    {item.label}
                  </span>
                  <ToggleButton
                    checked={(notifications as any)[item.key]}
                    onChange={() => {
                      const nextState = {
                        ...notifications,
                        [item.key]: !(notifications as any)[item.key],
                      };
                      setNotifications(nextState);
                      updatePreferenceMutation("notifications", nextState);
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card
            variant="outlined"
            padding="md"
            className="!rounded-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E6FBF3] text-[#10B981] rounded-xl">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">
                AI Upload Settings
              </h2>
            </div>
            <div className="space-y-4 pt-2">
              {[
                { key: "autoPublish", label: "Auto-publish after AI review" },
                { key: "removeBg", label: "Auto-remove background" },
                { key: "ocrDetection", label: "OCR product name detection" },
                {
                  key: "priceSuggestions",
                  label: "Auto-generate price suggestions",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#334155] font-medium">
                    {item.label}
                  </span>
                  <ToggleButton
                    checked={(aiSettings as any)[item.key]}
                    onChange={() => {
                      const nextState = {
                        ...aiSettings,
                        [item.key]: !(aiSettings as any)[item.key],
                      };
                      setAiSettings(nextState);
                      updatePreferenceMutation("aiSettings", nextState);
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            variant="outlined"
            padding="md"
            className="!rounded-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#EFF6FF] text-[#3B82F6] rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Map Visibility
              </h2>
            </div>
            <div className="space-y-4 pt-2">
              {[
                { key: "showStore", label: "Show store on public map" },
                { key: "livePins", label: "Show live product pins" },
                {
                  key: "enableDiscovery",
                  label: "Enable discovery by new buyers",
                },
                { key: "showHours", label: "Show operating hours on pin" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#334155] font-medium">
                    {item.label}
                  </span>
                  <ToggleButton
                    checked={(mapVisibility as any)[item.key]}
                    onChange={() => {
                      const nextState = {
                        ...mapVisibility,
                        [item.key]: !(mapVisibility as any)[item.key],
                      };
                      setMapVisibility(nextState);
                      updatePreferenceMutation("mapVisibility", nextState);
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card
            variant="outlined"
            padding="md"
            className="!rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#F5F3FF] text-[#7C3AED] rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Payout Settings
              </h2>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Bank Account (BCA)
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">••••4892</p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5 cursor-pointer border-none bg-transparent">
                  Change <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Payout Schedule
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">
                    Weekly · Every Monday
                  </p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5 cursor-pointer border-none bg-transparent">
                  Edit <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Snackbar
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

function ToggleButton({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer border-none ${checked ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}
