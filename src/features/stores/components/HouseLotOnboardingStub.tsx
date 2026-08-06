"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  FileText,
  Home,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { BackButton } from "@/shared/components/ui/BackButton";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ClearFormButton } from "@/shared/components/ui/ClearFormButton";
import { useCreateProperty } from "@/features/properties/hooks/useCreateProperty";
import { MapSelection } from "./MapSelection";
import {
  clearOnboardingDraft,
  getOnboardingDraftKey,
} from "../utils/onboardingDraft";

type SellerCapacity = "owner" | "broker" | "proxy";
type PropertyType = "house-lot" | "raw-land";

interface HouseLotDraft {
  sellerCapacity: SellerCapacity;
  legalName: string;
  phone: string;
  email: string;
  governmentIdName: string;
  selfieCaptured: boolean;
  propertyType: PropertyType;
  address: string;
  lat: number;
  lng: number;
  subdivision: string;
}

const DEFAULT_DRAFT: HouseLotDraft = {
  sellerCapacity: "owner",
  legalName: "",
  phone: "",
  email: "",
  governmentIdName: "",
  selfieCaptured: false,
  propertyType: "house-lot",
  address: "",
  lat: 16.4164,
  lng: 120.5931,
  subdivision: "",
};

const DRAFT_KEY = getOnboardingDraftKey("house-lot");
const LEGACY_DRAFT_KEY = "seller-onboarding-draft:house-lot-stub";

const inputClassName =
  "w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--brand-core)] focus:ring-2 focus:ring-[var(--brand-core)]/10";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand-core)]">
      {children}
    </p>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-tertiary)]">
      {children}
    </p>
  );
}

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-7" aria-label={`Onboarding progress: step ${step} of 2`}>
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
        <span className="text-[var(--text-primary)]">Property onboarding</span>
        <span className="text-[var(--text-tertiary)]">Step {step} of 2</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
        <div
          className="h-full rounded-full bg-[var(--brand-core)] transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-[var(--text-tertiary)]">
        <span className={step === 1 ? "text-[var(--brand-core)]" : ""}>
          Identity & authority
        </span>
        <span className={step === 2 ? "text-[var(--brand-core)]" : ""}>
          Property basics
        </span>
      </div>
    </div>
  );
}

export default function HouseLotOnboardingStub({
  onBack,
}: {
  onBack: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<HouseLotDraft>(DEFAULT_DRAFT);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      const savedDraft =
        localStorage.getItem(DRAFT_KEY) ??
        localStorage.getItem(LEGACY_DRAFT_KEY);
      if (savedDraft) setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(savedDraft) });
    } catch {
      // This is a visual stub; unavailable storage should not block the flow.
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Draft persistence is best effort only.
    }
  }, [draft, isDraftLoaded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOnboardingDraft("house-lot");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const updateDraft = <K extends keyof HouseLotDraft>(
    field: K,
    value: HouseLotDraft[K],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  const propertyMutation = useCreateProperty({
    onSuccess: () => {
      clearForm();
      setIsSubmitted(true);
    },
  });

  const clearForm = () => {
    setDraft(DEFAULT_DRAFT);
    setStep(1);
    setIsSubmitted(false);
    formRef.current?.reset();
    clearOnboardingDraft("house-lot");
    propertyMutation.reset();
  };

  const handleGovernmentId = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updateDraft("governmentIdName", file.name);
  };

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    setStep(2);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    propertyMutation.mutate(draft);
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg p-2 sm:p-4">
        <Card className="overflow-hidden border-[var(--border-light)] p-0 shadow-xl shadow-black/5">
          <div className="h-2 bg-emerald-500" />
          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            </div>
            <span className="mt-7 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
              Draft saved
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Property Saved
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
              Your house or lot onboarding details are safely saved as a draft
              and ready for the next review step.
            </p>
            <div className="my-8 border-t border-[var(--border-light)]" />
            <Button type="button" fullWidth onClick={onBack}>
              Back to Manage Your Storefronts
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl p-2 text-left sm:p-4">
      <Card className="overflow-hidden border-[var(--border-light)] p-0 shadow-xl shadow-black/5">
        <div className="bg-[var(--brand-dark)] px-5 py-6 text-white sm:px-8">
          <BackButton
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="-ml-3 mb-5 text-white/75 hover:bg-white/10 hover:text-white focus:ring-white/50"
          />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                House or Lot
              </p>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                List property with confidence
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                A few details help us verify your authority and present the
                property accurately.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <Progress step={step} />

          {step === 1 ? (
            <form ref={formRef} onSubmit={handleNext} className="space-y-7">
              <div>
                <SectionLabel>Seller identity & authority</SectionLabel>
                <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
                  Tell us who is listing this property
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  This helps us request the right documents later.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-[var(--text-primary)]">
                  What is your capacity?{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["owner", "Owner", "I own the property"],
                      ["broker", "Authorized Broker", "I represent the owner"],
                      [
                        "proxy",
                        "Proxy / Relative",
                        "I have permission to list",
                      ],
                    ] as const
                  ).map(([value, label, description]) => (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        draft.sellerCapacity === value
                          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 ring-2 ring-[var(--brand-core)]/10"
                          : "border-[var(--border-light)] hover:border-[var(--brand-core)]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sellerCapacity"
                        value={value}
                        checked={draft.sellerCapacity === value}
                        onChange={() => updateDraft("sellerCapacity", value)}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-2 text-sm font-black text-[var(--text-primary)]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[var(--brand-core)]">
                          {draft.sellerCapacity === value && (
                            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-core)]" />
                          )}
                        </span>
                        {label}
                      </span>
                      <span className="mt-2 block text-[11px] leading-5 text-[var(--text-tertiary)]">
                        {description}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldHint>
                  Your selection determines which legal documents we will
                  request later.
                </FieldHint>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="legalName"
                    className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Full legal name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="legalName"
                    required
                    value={draft.legalName}
                    onChange={(event) =>
                      updateDraft("legalName", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Name exactly as shown on your ID"
                  />
                  <FieldHint>
                    Must match your Government ID and the property title or
                    authorization letter exactly.
                  </FieldHint>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    <Phone className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
                    Phone number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={draft.phone}
                    onChange={(event) =>
                      updateDraft("phone", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    <Mail className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
                    Email address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={draft.email}
                    onChange={(event) =>
                      updateDraft("email", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Government ID <span className="text-rose-500">*</span>
                  </label>
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-light)] px-4 text-center transition-colors hover:border-[var(--brand-core)] hover:bg-[var(--brand-core)]/5">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleGovernmentId}
                      className="sr-only"
                    />
                    {draft.governmentIdName ? (
                      <Check className="mb-2 h-6 w-6 text-emerald-500" />
                    ) : (
                      <UploadCloud className="mb-2 h-6 w-6 text-[var(--brand-core)]" />
                    )}
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {draft.governmentIdName || "Upload Government ID"}
                    </span>
                    <span className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                      JPG, PNG, or PDF
                    </span>
                  </label>
                  <FieldHint>
                    Required for KYC compliance and identity verification.
                  </FieldHint>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Selfie liveness <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => updateDraft("selfieCaptured", true)}
                    className={`flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition-colors ${draft.selfieCaptured ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-[var(--border-light)] hover:border-[var(--brand-core)] hover:bg-[var(--brand-core)]/5"}`}
                  >
                    {draft.selfieCaptured ? (
                      <Check className="mb-2 h-6 w-6 text-emerald-500" />
                    ) : (
                      <Camera className="mb-2 h-6 w-6 text-[var(--brand-core)]" />
                    )}
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {draft.selfieCaptured
                        ? "Selfie captured"
                        : "Tap to capture selfie"}
                    </span>
                    <span className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                      Camera integration stub
                    </span>
                  </button>
                  <FieldHint>
                    Your selfie will be paired with your ID to verify the ID
                    holder.
                  </FieldHint>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                className="!h-12 rounded-2xl text-sm"
              >
                Next: Property basics
              </Button>
              <div className="flex justify-center pt-1">
                <ClearFormButton onClear={clearForm} />
              </div>
            </form>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
              <div>
                <SectionLabel>Property basics & location</SectionLabel>
                <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
                  Where is the property?
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Accurate location details help buyers understand the property
                  before they visit.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-[var(--text-primary)]">
                  Property type <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      [
                        "house-lot",
                        "House & Lot",
                        Home,
                        "A home with its land included",
                      ],
                      [
                        "raw-land",
                        "Raw Land",
                        LandPlot,
                        "An undeveloped parcel of land",
                      ],
                    ] as const
                  ).map(([value, label, Icon, description]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${draft.propertyType === value ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 ring-2 ring-[var(--brand-core)]/10" : "border-[var(--border-light)] hover:border-[var(--brand-core)]/50"}`}
                    >
                      <input
                        type="radio"
                        name="propertyType"
                        value={value}
                        checked={draft.propertyType === value}
                        onChange={() => updateDraft("propertyType", value)}
                        className="sr-only"
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-black text-[var(--text-primary)]">
                          {label}
                        </span>
                        <span className="mt-1 block text-[11px] text-[var(--text-tertiary)]">
                          {description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <FieldHint>
                  This choice changes the property details required in later
                  steps. Raw land does not need bedroom information.
                </FieldHint>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                >
                  <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
                  Complete address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="address"
                  required
                  value={draft.address}
                  onChange={(event) =>
                    updateDraft("address", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Street, barangay, city, province, ZIP"
                />
                <FieldHint>
                  Address suggestions will make legal documentation faster and
                  more accurate.
                </FieldHint>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">
                    <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
                    Interactive map pin <span className="text-rose-500">*</span>
                  </label>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <MapSelection
                  initialLat={draft.lat}
                  initialLng={draft.lng}
                  onChange={(lat, lng) =>
                    setDraft((current) => ({ ...current, lat, lng }))
                  }
                />
                <FieldHint>
                  Buyers rely on the exact location to understand roads, nearby
                  services, and surrounding conditions.
                </FieldHint>
              </div>

              <div>
                <label
                  htmlFor="subdivision"
                  className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Subdivision / Village{" "}
                  <span className="font-normal text-[var(--text-tertiary)]">
                    (Optional)
                  </span>
                </label>
                <input
                  id="subdivision"
                  value={draft.subdivision}
                  onChange={(event) =>
                    updateDraft("subdivision", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="e.g. Pineview Village"
                />
                <FieldHint>
                  This can add premium value and help buyers filter by gated
                  communities.
                </FieldHint>
              </div>

              <div className="flex w-full justify-end">
                <Button
                  type="submit"
                  fullWidth
                  className="!h-12 rounded-2xl text-sm sm:w-auto sm:min-w-48"
                  disabled={propertyMutation.isPending}
                >
                  {propertyMutation.isPending ? "Saving..." : "Done"}
                </Button>
              </div>
              <div className="flex justify-center">
                <ClearFormButton onClear={clearForm} />
              </div>
              <p className="flex items-center justify-center gap-2 text-center text-[10px] text-[var(--text-tertiary)]">
                <FileText className="h-3.5 w-3.5" /> Property data is saved as a
                backend draft for testing.
              </p>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
