"use client";

import React, { useState } from "react";
import {
  Bell,
  Zap,
  MapPin,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  // Toggle states
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-sans antialiased text-[#111111]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Settings Title Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Settings
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your seller account preferences
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  New order alerts
                </span>
                <ToggleButton
                  checked={notifications.newOrders}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      newOrders: !notifications.newOrders,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Low stock warnings
                </span>
                <ToggleButton
                  checked={notifications.lowStock}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      lowStock: !notifications.lowStock,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Customer reviews
                </span>
                <ToggleButton
                  checked={notifications.reviews}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      reviews: !notifications.reviews,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Promotional updates
                </span>
                <ToggleButton
                  checked={notifications.promotional}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      promotional: !notifications.promotional,
                    })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Auto-publish after AI review
                </span>
                <ToggleButton
                  checked={aiSettings.autoPublish}
                  onChange={() =>
                    setAiSettings({
                      ...aiSettings,
                      autoPublish: !aiSettings.autoPublish,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Auto-remove background
                </span>
                <ToggleButton
                  checked={aiSettings.removeBg}
                  onChange={() =>
                    setAiSettings({
                      ...aiSettings,
                      removeBg: !aiSettings.removeBg,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  OCR product name detection
                </span>
                <ToggleButton
                  checked={aiSettings.ocrDetection}
                  onChange={() =>
                    setAiSettings({
                      ...aiSettings,
                      ocrDetection: !aiSettings.ocrDetection,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Auto-generate price suggestions
                </span>
                <ToggleButton
                  checked={aiSettings.priceSuggestions}
                  onChange={() =>
                    setAiSettings({
                      ...aiSettings,
                      priceSuggestions: !aiSettings.priceSuggestions,
                    })
                  }
                />
              </div>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Show store on public map
                </span>
                <ToggleButton
                  checked={mapVisibility.showStore}
                  onChange={() =>
                    setMapVisibility({
                      ...mapVisibility,
                      showStore: !mapVisibility.showStore,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Show live product pins
                </span>
                <ToggleButton
                  checked={mapVisibility.livePins}
                  onChange={() =>
                    setMapVisibility({
                      ...mapVisibility,
                      livePins: !mapVisibility.livePins,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Enable discovery by new buyers
                </span>
                <ToggleButton
                  checked={mapVisibility.enableDiscovery}
                  onChange={() =>
                    setMapVisibility({
                      ...mapVisibility,
                      enableDiscovery: !mapVisibility.enableDiscovery,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155] font-medium">
                  Show operating hours on pin
                </span>
                <ToggleButton
                  checked={mapVisibility.showHours}
                  onChange={() =>
                    setMapVisibility({
                      ...mapVisibility,
                      showHours: !mapVisibility.showHours,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Payout Settings Card */}
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
              {/* Bank Account */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Bank Account (BCA)
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">••••4892</p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5">
                  Change <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Payout Schedule */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Payout Schedule
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">
                    Weekly · Every Monday
                  </p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5">
                  Edit <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Minimum Payout */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Minimum Payout
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">$20.00</p>
                </div>
                <button className="text-sm font-semibold text-[#10B981] hover:text-[#0D9488] flex items-center gap-0.5">
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
            {/* Action Row Component used here */}
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

/* reusable internal components for modular code structure */

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
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
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
