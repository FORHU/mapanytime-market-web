"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { MapSelection } from "@/features/stores/components/MapSelection";
import { useCategories } from "@/features/stores/hooks/useCategories";
import { completeSellerOnboarding } from "../api/agent.client";
import type {
  AgentOnboardingInput,
  AgentOnboardingResult,
  SellerRegistrationResult,
} from "../types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  KeyRound,
  MapPin,
  Store,
} from "lucide-react";

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":");
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
};

type Step = "welcome" | "store" | "complete";

export default function AgentOnboardingForm({
  seller,
  onComplete,
  onBack,
  initialStep = "store",
}: {
  seller: SellerRegistrationResult;
  onComplete: (result: AgentOnboardingResult) => void;
  onBack?: () => void;
  initialStep?: Step;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const [result, setResult] = useState<AgentOnboardingResult | null>(null);
  const [formData, setFormData] = useState({
    storeName: seller.storeName,
    businessEmail: seller.businessEmail,
    businessPhone: seller.businessPhone,
    categoryId: "",
    lat: 16.4164,
    lng: 120.5931,
    currentAddress: "",
    homeAddress: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
    openTime: "08:00",
    closeTime: "20:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const isStoreValid = Boolean(
    formData.storeName &&
    formData.businessEmail &&
    formData.businessPhone &&
    formData.categoryId &&
    formData.currentAddress &&
    formData.homeAddress &&
    formData.city &&
    formData.province &&
    formData.zipCode,
  );

  const submitOnboarding = async (event: FormEvent) => {
    event.preventDefault();
    if (!isStoreValid) {
      toast.error("Complete the required store details before continuing.");
      return;
    }

    const input: AgentOnboardingInput = {
      storeData: {
        storeName: formData.storeName,
        categoryIds: [formData.categoryId],
        email: formData.businessEmail,
        phone: formData.businessPhone,
      },
      locationData: {
        currentAddress: formData.currentAddress,
        homeAddress: formData.homeAddress,
        city: formData.city,
        province: formData.province,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: formData.lat,
        longitude: formData.lng,
      },
      hoursData: DAYS_OF_WEEK.map((dayOfWeek) => ({
        dayOfWeek,
        openMinutes: toMinutes(formData.openTime),
        closeMinutes: toMinutes(formData.closeTime),
        isClosed: false,
      })),
    };

    setIsSubmitting(true);
    try {
      const onboardingResult = await completeSellerOnboarding(
        seller.sellerId,
        input,
      );
      setResult(onboardingResult);
      setStep("complete");
      toast.success("Seller onboarding completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Onboarding failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "complete" && result) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center space-y-5">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
        <div>
          <h2 className="text-xl font-black">Seller Fully Onboarded</h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            {seller.storeName} can now sign in and continue directly to the
            Merchant Portal.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left text-xs space-y-2">
          <p className="flex justify-between">
            <span>Store ID</span>
            <strong>{result.storeId}</strong>
          </p>
          <p className="flex justify-between">
            <span>Onboarding step</span>
            <strong>{result.onboardingStep}</strong>
          </p>
          <p className="flex justify-between">
            <span>Status</span>
            <strong className="text-emerald-500">{result.status}</strong>
          </p>
        </div>
        <Button fullWidth onClick={() => onComplete(result)}>
          Return to Agent Workspace
        </Button>
      </Card>
    );
  }

  if (step === "welcome") {
    return (
      <Card className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black">Account Created</h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Complete the Seller setup on their behalf.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-4 space-y-3 text-xs">
          <p className="font-bold text-[var(--text-secondary)]">
            Merchant credentials
          </p>
          <p className="flex justify-between gap-4">
            <span>Email</span>
            <strong>{seller.email}</strong>
          </p>
          <p className="flex justify-between gap-4">
            <span>Temporary password</span>
            <strong className="font-mono">{seller.temporaryPassword}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(
                `Email: ${seller.email}\nTemporary password: ${seller.temporaryPassword}`,
              );
              toast.success("Credentials copied");
            }}
            className="inline-flex items-center gap-1.5 text-cyan-400 font-bold"
          >
            <Copy className="w-3.5 h-3.5" /> Copy credentials
          </button>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-amber-500">
          <KeyRound className="w-3.5 h-3.5" /> Share the temporary password
          securely with the Seller.
        </div>
        <Button fullWidth onClick={() => setStep("store")}>
          Continue to Store Setup <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center">
          <Store className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-black">Store Setup</h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            Configure the Seller&apos;s first storefront.
          </p>
        </div>
      </div>

      <form onSubmit={submitOnboarding} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1.5 sm:col-span-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Store Name *
            <input
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Business Email *
            <input
              type="email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Business Phone *
            <input
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Category *
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={categoriesLoading}
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select a category"}
              </option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Street Address *
            <input
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Mailing Address *
            <input
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            City *
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Province *
            <input
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Zip Code *
            <input
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Country *
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <div className="sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Store Location
            </p>
            <MapSelection
              initialLat={formData.lat}
              initialLng={formData.lng}
              onChange={(lat, lng) =>
                setFormData((current) => ({ ...current, lat, lng }))
              }
            />
          </div>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" /> Open Time *
            </span>
            <input
              type="time"
              name="openTime"
              value={formData.openTime}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
          <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" /> Close Time *
            </span>
            <input
              type="time"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-3 rounded-xl border bg-[var(--background-primary)] text-xs normal-case tracking-normal text-[var(--text-primary)]"
            />
          </label>
        </div>
        <div className="flex justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBack ?? (() => setStep("welcome"))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!isStoreValid}
          >
            Complete Seller Onboarding <CheckCircle2 className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
