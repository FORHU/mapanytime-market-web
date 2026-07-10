"use client";

import React, { useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Sliders, Map, Bell, Percent, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specific toggles that change on a per-store basis
  const [settings, setSettings] = useState({
    discoveryRadius: 5.0,
    allowInstantCheckout: true,
    localTaxRate: 8.25,
    notifyOnLowStock: true,
  });

  const settingsApi = async () => {
    setIsSubmitting(true);

    console.log("Saving store-isolated configurations to DB node:", settings);
    // await axios.patch('/api/stores/settings', settings);

    setIsSubmitting(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsApi();
  };

  const handleDiscoveryRadiusChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSettings((prev) => ({
      ...prev,
      discoveryRadius: Number(e.target.value),
    }));
  };

  const handleLocalTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      localTaxRate: Number(e.target.value),
    }));
  };

  const handleInstantCheckoutToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSettings((prev) => ({
      ...prev,
      allowInstantCheckout: e.target.checked,
    }));
  };

  const handleLowStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      notifyOnLowStock: e.target.checked,
    }));
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto pt-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Isolated Node Settings
        </h1>
        <p className="text-xs text-zinc-400">
          Configure rules specific to this individual active storefront channel.
        </p>
      </div>

      <Card className="p-6 border border-[var(--border-default)] shadow-sm">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Spatial Discovery Threshold Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[var(--brand-core)]" /> Spatial
              Tracking Bounds
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Consumer Visibility Ingestion Radius ({settings.discoveryRadius}{" "}
                km)
              </label>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={settings.discoveryRadius}
                onChange={handleDiscoveryRadiusChange}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--brand-core)]"
              />
            </div>
          </div>

          {/* Operational Accounting Rules */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-light)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-[var(--brand-core)]" />{" "}
              Transaction Architecture
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Localized Merchant Tax Model (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.localTaxRate}
                onChange={handleLocalTaxRateChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all border-[var(--border-light)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Core Feature Matrix Toggles */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[var(--brand-core)]" />{" "}
              Channel Logic Toggles
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-[var(--border-light)]">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Authorize Hyperlocal Instant Checkout
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Skip secondary ledger confirmation chains.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowInstantCheckout}
                onChange={handleInstantCheckoutToggle}
                className="w-4 h-4 rounded text-[var(--brand-core)] bg-transparent border-zinc-300 focus:ring-[var(--brand-core)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-[var(--border-light)]">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Stock Depletion Alert Webhooks
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Trigger warnings when store metrics fall below safety margins.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyOnLowStock}
                onChange={handleLowStockToggle}
                className="w-4 h-4 rounded text-[var(--brand-core)] bg-transparent border-zinc-300 focus:ring-[var(--brand-core)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
            >
              Save Isolated Parameters
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
