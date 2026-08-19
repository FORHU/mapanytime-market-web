"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { useCreatePromotion } from "../hooks/usePromotionMutations";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import type { StoreProfile } from "@/features/store-profile/contracts/store-profile.contract";
import {
  MapPin,
  Eye,
  ShoppingBag,
  Sparkles,
  Tag,
  Store,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Flame,
  Radio,
  Clock,
} from "lucide-react";

interface PromoteStoreWizardModalProps {
  storeId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

type CampaignGoal = "VISITS" | "VIEWS" | "PURCHASES";
type CampaignType = "DISCOUNT" | "FLASH_SALE" | "NEW_PRODUCT" | "FEATURED";

export function PromoteStoreWizardModal({
  storeId,
  onClose,
  onSuccess,
}: PromoteStoreWizardModalProps) {
  const { data: stores } = useStoreProfiles();
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    storeId || (stores && stores[0]?.id) || "",
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [goal, setGoal] = useState<CampaignGoal>("VISITS");
  const [campaignType, setCampaignType] = useState<CampaignType>("DISCOUNT");
  const [title, setTitle] = useState("20% OFF Today Only");
  const [description, setDescription] = useState(
    "Get 20% off all handcrafted coffee and fresh pastries when ordering ahead for pickup.",
  );
  const [badgeLabel, setBadgeLabel] = useState("20% OFF");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [dailyBudget, setDailyBudget] = useState<number>(250);
  const [durationDays, setDurationDays] = useState<number>(7);

  const activeStoreObj = stores?.find((s) => s.id === selectedStoreId);
  const createMutation = useCreatePromotion(selectedStoreId);

  const handleLaunch = () => {
    if (!selectedStoreId) {
      toast.error("Please select a store to promote.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + durationDays);

    createMutation.mutate(
      {
        storeId: selectedStoreId,
        kind: "PROMO",
        title: title.trim(),
        description: description.trim(),
        badgeLabel: badgeLabel.trim() || `${discountValue}% OFF`,
        ctaLabel: "View Offer",
        discountType: "PERCENTAGE",
        discountValue: Number(discountValue) || 10,
        expiresAt: expiresDate.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Campaign launched successfully!");
          onSuccess();
          onClose();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to launch campaign.",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[var(--background-elevated)] border shadow-2xl overflow-hidden flex flex-col text-left"
        style={{ borderColor: "var(--border-default)" }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--background-secondary)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Promote This Store
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Location-based discovery campaign for nearby customers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-[var(--border-light)] bg-[var(--background-secondary)]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            {[
              { num: 1, label: "1. Goal" },
              { num: 2, label: "2. Offer" },
              { num: 3, label: "3. Radius" },
              { num: 4, label: "4. Budget" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={`font-semibold flex items-center gap-1.5 transition-colors ${
                  step === s.num
                    ? "text-[var(--brand-core)]"
                    : step > s.num
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[var(--text-tertiary)]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === s.num
                      ? "bg-[var(--brand-core)] text-white"
                      : step > s.num
                        ? "bg-emerald-500 text-white"
                        : "bg-[var(--background-tertiary)] text-[var(--text-secondary)]"
                  }`}
                >
                  {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Store Selector (if in All Stores context) */}
          {stores && stores.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Store className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <select
                aria-label="Select Store"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="px-2 py-1 border rounded-lg text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-light)" }}
              >
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Modal Body: Left Wizard Form + Right Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: GOAL */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    What is your campaign goal?
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    We&apos;ll optimize your map pin and card visibility for
                    this goal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "VISITS",
                      title: "Store Visits",
                      desc: "Drive foot traffic and walk-in pickup customers.",
                      icon: MapPin,
                      badge: "📍 Foot Traffic",
                    },
                    {
                      id: "VIEWS",
                      title: "Get Views",
                      desc: "Maximize impressions in Promotions Near You.",
                      icon: Eye,
                      badge: "👀 Brand Lift",
                    },
                    {
                      id: "PURCHASES",
                      title: "Get Orders",
                      desc: "Promote items for direct pickup checkout.",
                      icon: ShoppingBag,
                      badge: "🛒 Conversions",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as CampaignGoal)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                        goal === item.id
                          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 shadow-sm ring-1 ring-[var(--brand-core)]"
                          : "border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <item.icon
                          className={`w-5 h-5 ${
                            goal === item.id
                              ? "text-[var(--brand-core)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        />
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--background-elevated)] border text-[var(--text-secondary)]">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: OFFER */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Choose your offer format
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Eye-catching offers perform 3.4x better on local maps.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "DISCOUNT", label: "Discount %", icon: Tag },
                    { id: "FLASH_SALE", label: "Flash Sale", icon: Flame },
                    { id: "NEW_PRODUCT", label: "New Item", icon: Sparkles },
                    { id: "FEATURED", label: "Featured Store", icon: Store },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setCampaignType(t.id as CampaignType);
                        if (t.id === "FLASH_SALE") {
                          setTitle("⚡ Flash Sale: 30% OFF");
                          setBadgeLabel("FLASH 30%");
                          setDiscountValue(30);
                        } else if (t.id === "NEW_PRODUCT") {
                          setTitle("✨ Fresh Arrival: Try Today");
                          setBadgeLabel("NEW");
                        } else if (t.id === "FEATURED") {
                          setTitle("⭐ Top Rated Local Favorite");
                          setBadgeLabel("FEATURED");
                        }
                      }}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all flex flex-col items-center gap-1.5 ${
                        campaignType === t.id
                          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/10 text-[var(--brand-core)] font-bold shadow-sm"
                          : "border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Offer Headline
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 20% OFF Handcrafted Drinks"
                      className="w-full px-3.5 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)]"
                      style={{ borderColor: "var(--border-light)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Badge Chip
                      </label>
                      <input
                        type="text"
                        value={badgeLabel}
                        onChange={(e) => setBadgeLabel(e.target.value)}
                        placeholder="e.g. 20% OFF"
                        className="w-full px-3.5 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)]"
                        style={{ borderColor: "var(--border-light)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Discount Value (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={discountValue}
                        onChange={(e) =>
                          setDiscountValue(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3.5 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)]"
                        style={{ borderColor: "var(--border-light)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the promotion terms or highlighted menu items..."
                      className="w-full px-3.5 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] text-[var(--text-primary)] resize-none"
                      style={{ borderColor: "var(--border-light)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: RADIUS */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Target Discovery Radius
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Only buyers inside this radius will see your promoted pin
                    and card.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      km: 1,
                      label: "1 km Radius",
                      desc: "Walking distance. Best for cafes, bakeries & fast food.",
                      icon: "🚶",
                    },
                    {
                      km: 3,
                      label: "3 km Radius",
                      desc: "Neighborhood reach. Best for retail, groceries & pharmacies.",
                      icon: "🚲",
                    },
                    {
                      km: 5,
                      label: "5 km Radius",
                      desc: "Town/City coverage. Best for specialty shops & bulk orders.",
                      icon: "🚗",
                    },
                  ].map((r) => (
                    <button
                      key={r.km}
                      type="button"
                      onClick={() => setRadiusKm(r.km)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                        radiusKm === r.km
                          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 ring-1 ring-[var(--brand-core)] shadow-sm"
                          : "border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)]"
                      }`}
                    >
                      <div className="text-2xl">{r.icon}</div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {r.label}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div
                  className="p-3.5 rounded-xl bg-[var(--background-secondary)] border text-xs text-[var(--text-secondary)] flex items-center gap-2.5"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <Compass className="w-4 h-4 text-[var(--brand-core)] shrink-0" />
                  <span>
                    Estimated audience reach:{" "}
                    <strong className="text-[var(--text-primary)]">
                      {radiusKm === 1
                        ? "1,200 - 2,800"
                        : radiusKm === 3
                          ? "4,500 - 9,200"
                          : "12,000 - 25,000"}{" "}
                      active shoppers
                    </strong>{" "}
                    within {radiusKm} km.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: OPTIONAL ADVERTISING BUDGET & DURATION */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Optional Advertising Campaign
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Advertising is 100% optional. You can launch a free
                    promotion or boost it with a paid daily budget.
                  </p>
                </div>

                {/* Free vs Paid Toggle Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDailyBudget(0)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                      dailyBudget === 0
                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-sm"
                        : "border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        🌱 Free Promotion
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₱0
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Publish discount for organic store discovery. No
                      advertising fees or daily budget charged.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (dailyBudget === 0) setDailyBudget(250);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                      dailyBudget > 0
                        ? "border-[var(--brand-core)] bg-[var(--brand-core)]/10 ring-1 ring-[var(--brand-core)] shadow-sm"
                        : "border-[var(--border-light)] bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        ⚡ Paid Map Boost
                      </span>
                      <span className="text-xs font-extrabold text-[var(--brand-core)]">
                        From ₱100/day
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Boost to the top of the map, floating deal card, and
                      &quot;🔥 Promotions Near You&quot; carousel.
                    </p>
                  </button>
                </div>

                {/* Paid Budget Details (Only shown when dailyBudget > 0) */}
                {dailyBudget > 0 && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Select Daily Budget
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[100, 250, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDailyBudget(amt)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              dailyBudget === amt
                                ? "border-[var(--brand-core)] bg-[var(--brand-core)]/10 text-[var(--brand-core)] font-bold ring-1 ring-[var(--brand-core)]"
                                : "border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            <p className="text-sm font-bold">₱{amt}</p>
                            <p className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)]">
                              / day
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Campaign Duration
                      </label>
                      <div className="flex items-center gap-2">
                        {[3, 7, 14, 30].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDurationDays(d)}
                            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold ${
                              durationDays === d
                                ? "bg-[var(--brand-core)] text-white border-[var(--brand-core)] shadow-sm"
                                : "border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-secondary)]"
                            }`}
                          >
                            {d} days
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                        <span>Total Advertising Budget</span>
                        <span>
                          ₱{(dailyBudget * durationDays).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Runs for {durationDays} days at ₱{dailyBudget}/day.
                        Unused advertising spend is refundable.
                      </p>
                    </div>
                  </div>
                )}

                {dailyBudget === 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold">
                      ✓ Free promotion will be live immediately in your store
                      catalog and map profile with ₱0 marketing cost.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Live Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />{" "}
              Live Buyer Preview
            </span>

            <div
              className="p-4 rounded-2xl bg-[var(--background-secondary)]/80 border space-y-4 shadow-sm"
              style={{ borderColor: "var(--border-light)" }}
            >
              {/* Preview 1: Floating Map Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  1. Floating Map Card
                </span>
                <div
                  className="p-3 rounded-2xl bg-[var(--background-elevated)] border shadow-md space-y-2 text-left"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      🔥 {badgeLabel || "PROMO"}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--brand-core)]">
                      {radiusKm}km away
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {title || "Special Offer"}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                      {activeStoreObj?.storeName || "Your Store"}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-2">
                      {description || "Limited time offer for local pickup."}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-[var(--border-light)]">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {discountValue}% OFF Total
                    </span>
                    <span className="text-[11px] font-bold text-[var(--brand-core)] underline">
                      View Offer →
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview 2: Promoted Map Marker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  2. Promoted Map Pin
                </span>
                <div className="p-3 rounded-xl bg-[var(--background-elevated)] border flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-core)] text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-[var(--brand-core)]/20">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white shadow-sm">
                      SALE
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      {activeStoreObj?.storeName || "Store Pin"}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Highlighted with glowing promo badge
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-tertiary)] italic">
                Placement: Bottom map card, &quot;🔥 Promotions Near You&quot;
                carousel, and nearby search results.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[var(--border-light)] bg-[var(--background-secondary)]/50 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              if (step > 1) setStep((s) => (s - 1) as any);
              else onClose();
            }}
            className="!text-xs"
          >
            {step > 1 ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </>
            ) : (
              "Cancel"
            )}
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="!text-xs bg-[var(--brand-core)] text-white shadow-md"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={createMutation.isPending}
              className="!text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
            >
              {createMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Campaign</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
