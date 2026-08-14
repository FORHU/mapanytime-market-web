"use client";

import React, { useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Sliders, Map, Percent, Info } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    discoveryRadius: 5.0,
    allowInstantCheckout: true,
    localTaxRate: 8.25,
    notifyOnLowStock: true,
  });

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
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Store preferences
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Settings that apply to the store you&apos;re currently managing.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          These preferences aren&apos;t saved yet — this is a preview of what
          you&apos;ll be able to control. Nothing here affects your live store.
        </p>
      </div>

      <Card className="p-6 border border-[var(--border-default)] shadow-sm">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[var(--brand-core)]" /> Where
              customers can find you
            </h3>
            <div className="space-y-1">
              <label className="text-sm text-[var(--text-secondary)]">
                Show my store to customers within{" "}
                <strong className="text-[var(--text-primary)]">
                  {settings.discoveryRadius} km
                </strong>
              </label>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={settings.discoveryRadius}
                onChange={handleDiscoveryRadiusChange}
                className="w-full h-1.5 bg-[var(--background-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-core)]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[var(--border-light)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[var(--brand-core)]" /> Tax
            </h3>
            <div className="space-y-1">
              <label className="text-sm text-[var(--text-secondary)]">
                Local tax rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.localTaxRate}
                onChange={handleLocalTaxRateChange}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all border-[var(--border-light)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--border-light)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[var(--brand-core)]" /> Options
            </h3>

            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-light)]">
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)]">
                  Allow instant checkout
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Customers can pay without an extra confirmation step.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowInstantCheckout}
                onChange={handleInstantCheckoutToggle}
                className="w-4 h-4 shrink-0 rounded text-[var(--brand-core)] bg-transparent border-zinc-300 focus:ring-[var(--brand-core)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-light)]">
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)]">
                  Alert me about low stock
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Get a heads-up when an item is nearly sold out.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyOnLowStock}
                onChange={handleLowStockToggle}
                className="w-4 h-4 shrink-0 rounded text-[var(--brand-core)] bg-transparent border-zinc-300 focus:ring-[var(--brand-core)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              disabled
              title="Saving preferences isn't available yet"
              className="!text-sm px-6"
            >
              Save (not available yet)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
