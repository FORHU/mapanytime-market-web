"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Bell,
  Zap,
  MapPin,
  CreditCard,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Core Account Preferences States Matrix
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

  // Auto-clear toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 1. GET: Fetch active store preference values ---
  useEffect(() => {
    if (!storeId) return;

    const fetchStorePreferences = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://192.168.1.101:3002/api/v1/stores/${storeId}/settings`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok)
          throw new Error("Could not retrieve preference records.");
        const dbData = await response.json();
        const config = dbData?.data || dbData;

        // Populate local states with live backend configurations if defined
        if (config.notifications) setNotifications(config.notifications);
        if (config.aiSettings) setAiSettings(config.aiSettings);
        if (config.mapVisibility) setMapVisibility(config.mapVisibility);
      } catch (error) {
        console.error("Failed to parse settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorePreferences();
  }, [storeId]);

  // --- 2. PATCH: Update preferences asynchronously on change mutation ---
  const updatePreferenceMutation = async (
    section: string,
    updatedPayload: object,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://192.168.1.101:3002/api/v1/stores/${storeId}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [section]: updatedPayload }),
        },
      );

      if (!response.ok) throw new Error("Server rejected state mutation.");
      setToast({
        message: "Preferences synchronized instantly!",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        message: error.message || "Failed to sync configurations.",
        type: "error",
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
      {/* Dynamic Toast Feedback Notification Panel */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl border text-xs font-bold shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Settings Title Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Settings
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your seller account preferences across branch:{" "}
            <span className="font-mono text-emerald-600">{storeId}</span>
          </p>
        </div>

        {/* ROW 1: Notifications & AI Upload Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
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
          </div>

          {/* AI Upload Settings Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
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
          </div>
        </div>

        {/* ROW 2: Map Visibility & Payout Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Visibility Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
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
          </div>

          {/* Payout Settings Card (Static Layout Shell) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
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
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5 cursor-pointer">
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
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5 cursor-pointer">
                  Edit <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Minimum Payout
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">
                    ₱1,000.00
                  </p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5 cursor-pointer">
                  Edit <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Account & Security Block */}
        <div className="max-w-full bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FEF2F2] text-[#EF4444] rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Account & Security
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <ActionRow
              title="Change Password"
              subtitle="Last changed 45 days ago"
            />
            <ActionRow
              title="Two-Factor Auth"
              subtitle="Enabled via Authenticator App"
            />
            <ActionRow
              title="Download My Data"
              subtitle="Export all store data"
            />
            <ActionRow
              title="Pause Store"
              subtitle="Temporarily hide from map"
            />
          </div>
        </div>
      </div>
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
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
        checked ? "bg-[#10B981]" : "bg-[#E2E8F0]"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ActionRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="group flex items-center justify-between p-4 bg-white hover:bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl cursor-pointer transition-colors">
      <div>
        <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#0F172A]">
          {title}
        </p>
        <p className="text-xs font-medium text-[#94A3B8] mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#64748B]" />
    </div>
  );
}
