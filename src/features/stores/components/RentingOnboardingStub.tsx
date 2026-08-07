"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Building2Icon,
  CameraIcon,
  CheckIcon,
  HomeIcon,
  KeyRoundIcon,
  UploadCloudIcon,
} from "lucide-react";
import { BackButton } from "@/shared/components/ui/BackButton";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ClearFormButton } from "@/shared/components/ui/ClearFormButton";
import { MapSelection } from "./MapSelection";
import {
  clearOnboardingDraft,
  getOnboardingDraftKey,
} from "../utils/onboardingDraft";

type ListerRole = "owner" | "manager" | "broker" | "sublessor";
type RentalType = "house" | "apartment" | "room";

interface RentingDraft {
  listerRole: ListerRole;
  legalName: string;
  phone: string;
  email: string;
  governmentId: string;
  selfieCaptured: boolean;
  proofOfAuthority: string;
  rentalType: RentalType;
  address: string;
  lat: number;
  lng: number;
}

const DEFAULT_DRAFT: RentingDraft = {
  listerRole: "owner",
  legalName: "",
  phone: "",
  email: "",
  governmentId: "",
  selfieCaptured: false,
  proofOfAuthority: "",
  rentalType: "house",
  address: "",
  lat: 16.4164,
  lng: 120.5931,
};

const DRAFT_KEY = getOnboardingDraftKey("renting");

const inputClassName =
  "w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--brand-core)] focus:ring-2 focus:ring-[var(--brand-core)]/10";

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-7" aria-label={`Onboarding progress: step ${step} of 2`}>
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
        <span className="text-[var(--text-primary)]">Add Listing</span>
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

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-tertiary)]">
      {children}
    </p>
  );
}

function UploadStub({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-light)] px-4 text-center transition-colors hover:border-[var(--brand-core)] hover:bg-[var(--brand-core)]/5">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        className="sr-only"
      />
      {value ? (
        <CheckIcon className="mb-2 h-6 w-6 text-emerald-500" />
      ) : (
        <UploadCloudIcon className="mb-2 h-6 w-6 text-[var(--brand-core)]" />
      )}
      <span className="max-w-full truncate text-xs font-bold text-[var(--text-primary)]">
        {value || label}
      </span>
      <span className="mt-1 text-[10px] text-[var(--text-tertiary)]">
        JPG, PNG, or PDF
      </span>
    </label>
  );
}

export default function RentingOnboardingStub({
  onBack,
}: {
  onBack: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<RentingDraft>(DEFAULT_DRAFT);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(savedDraft) });
      }
    } catch {
      // Draft persistence is best effort for this frontend-only stub.
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [draft, isDraftLoaded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOnboardingDraft("renting");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const updateDraft = <K extends keyof RentingDraft>(
    field: K,
    value: RentingDraft[K],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  const clearForm = () => {
    setDraft(DEFAULT_DRAFT);
    setStep(1);
    formRef.current?.reset();
    clearOnboardingDraft("renting");
  };

  const handleNext = (event: FormEvent) => {
    event.preventDefault();
    setStep(2);
  };

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
              <KeyRoundIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                Renting
              </p>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                Add Listing
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Set up your rental listing with clear ownership and location
                details.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <Progress step={step} />

          {step === 1 ? (
            <form ref={formRef} onSubmit={handleNext} className="space-y-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand-core)]">
                  Landlord identity & authority
                </p>
                <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
                  1. Landlord Identity & Authority
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Tell us who is listing the rental so we can request the right
                  verification documents.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-[var(--text-primary)]">
                  Lister Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-3 rounded-2xl border border-[var(--border-light)] p-3 sm:grid-cols-4">
                  {(
                    [
                      ["owner", "Owner"],
                      ["manager", "Property Manager"],
                      ["broker", "Broker"],
                      ["sublessor", "Sublessor"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${
                        draft.listerRole === value
                          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 text-[var(--brand-core)]"
                          : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-light)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="listerRole"
                        value={value}
                        checked={draft.listerRole === value}
                        onChange={() => updateDraft("listerRole", value)}
                        className="h-4 w-4 accent-[var(--brand-core)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="renting-legal-name"
                  className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="renting-legal-name"
                  required
                  value={draft.legalName}
                  onChange={(event) =>
                    updateDraft("legalName", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Enter your name as shown on your government ID"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Contact Info <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-3 rounded-2xl border border-[var(--border-light)] p-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="renting-phone"
                      className="mb-1.5 block text-[11px] font-bold text-[var(--text-secondary)]"
                    >
                      Phone Number
                    </label>
                    <input
                      id="renting-phone"
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
                      htmlFor="renting-email"
                      className="mb-1.5 block text-[11px] font-bold text-[var(--text-secondary)]"
                    >
                      Email Address
                    </label>
                    <input
                      id="renting-email"
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Government ID & Selfie (File Upload + Camera){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadStub
                    label="Upload Govt. ID"
                    value={draft.governmentId}
                    onChange={(event) =>
                      updateDraft(
                        "governmentId",
                        event.target.files?.[0]?.name ?? "",
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => updateDraft("selfieCaptured", true)}
                    className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition-colors ${draft.selfieCaptured ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-[var(--border-light)] hover:border-[var(--brand-core)] hover:bg-[var(--brand-core)]/5"}`}
                  >
                    {draft.selfieCaptured ? (
                      <CheckIcon className="mb-2 h-6 w-6 text-emerald-500" />
                    ) : (
                      <CameraIcon className="mb-2 h-6 w-6 text-[var(--brand-core)]" />
                    )}
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {draft.selfieCaptured ? "Selfie captured" : "Take Selfie"}
                    </span>
                    <span className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                      Camera integration stub
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Proof of Authority (File Upload){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <UploadStub
                  label="Upload Proof"
                  value={draft.proofOfAuthority}
                  onChange={(event) =>
                    updateDraft(
                      "proofOfAuthority",
                      event.target.files?.[0]?.name ?? "",
                    )
                  }
                />
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
            <form
              ref={formRef}
              onSubmit={(event) => event.preventDefault()}
              className="space-y-7"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand-core)]">
                  Property basics & location
                </p>
                <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
                  2. Property Basics & Location
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Help renters understand what they are booking and exactly
                  where it is located.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-[var(--text-primary)]">
                  Rental Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid gap-3 rounded-2xl border border-[var(--border-light)] p-3 sm:grid-cols-3">
                  {(
                    [
                      ["house", "House", HomeIcon],
                      ["apartment", "Apartment/Condo", Building2Icon],
                      ["room", "Room for Rent", KeyRoundIcon],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${draft.rentalType === value ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 text-[var(--brand-core)]" : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-light)]"}`}
                    >
                      <input
                        type="radio"
                        name="rentalType"
                        value={value}
                        checked={draft.rentalType === value}
                        onChange={() => updateDraft("rentalType", value)}
                        className="h-4 w-4 accent-[var(--brand-core)]"
                      />
                      <Icon className="h-4 w-4" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="renting-address"
                  className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Complete Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="renting-address"
                  required
                  value={draft.address}
                  onChange={(event) =>
                    updateDraft("address", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Street, barangay, city, province, ZIP"
                />
                <FieldHint>
                  For privacy, avoid entering a unit number if you do not want
                  it shown publicly.
                </FieldHint>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-[var(--text-primary)]">
                    Map Pin <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-[var(--brand-core)]">
                    Frontend preview
                  </span>
                </div>
                <MapSelection
                  initialLat={draft.lat}
                  initialLng={draft.lng}
                  label="Rental location"
                  hint="* Drag the marker or click on the map to set the exact rental location."
                  onChange={(lat, lng) =>
                    setDraft((current) => ({ ...current, lat, lng }))
                  }
                />
              </div>

              <div className="flex w-full justify-end">
                <Button
                  type="button"
                  fullWidth
                  className="!h-12 rounded-2xl text-sm sm:w-auto sm:min-w-48"
                  onClick={() => undefined}
                >
                  Done
                </Button>
              </div>
              <div className="flex justify-center">
                <ClearFormButton onClear={clearForm} />
              </div>
              <p className="text-center text-[10px] text-[var(--text-tertiary)]">
                Frontend preview only. No rental listing will be submitted yet.
              </p>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
