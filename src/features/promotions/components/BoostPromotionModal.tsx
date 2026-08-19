"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import type { Promotion } from "../contracts/promotions.contract";
import { Zap, Sparkles, X, Check, ArrowRight } from "lucide-react";

interface BoostPromotionModalProps {
  promotion: Promotion;
  onClose: () => void;
}

export function BoostPromotionModal({
  promotion,
  onClose,
}: BoostPromotionModalProps) {
  const [boostAmount, setBoostAmount] = useState<number>(200);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBoost = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Boosted "${promotion.title}" with ₱${boostAmount}!`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--background-elevated)] border shadow-2xl p-6 space-y-4 text-left"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Boost Campaign
              </h3>
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-[220px]">
                {promotion.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Boosting puts your store at the top of the map and in the first 3
          cards of the &quot;🔥 Promotions Near You&quot; carousel.
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            Select Boost Amount
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[100, 200, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBoostAmount(amt)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  boostAmount === amt
                    ? "border-[var(--brand-core)] bg-[var(--brand-core)]/10 text-[var(--brand-core)] font-bold shadow-sm"
                    : "border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <p className="text-sm font-bold">₱{amt}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  +{amt * 6} views
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-bold">⚡ Instant Priority:</span> Active for the
          next 24 hours in your store&apos;s local radius.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-light)]">
          <Button variant="secondary" onClick={onClose} className="!text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleBoost}
            disabled={isProcessing}
            className="!text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5"
          >
            {isProcessing ? (
              "Boosting…"
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Confirm Boost (₱{boostAmount})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
