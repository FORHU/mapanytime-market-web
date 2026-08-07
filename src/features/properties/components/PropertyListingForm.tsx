"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FileCheck2Icon,
  FileTextIcon,
  HomeIcon,
  LandPlotIcon,
  MinusIcon,
  PlusIcon,
  RulerIcon,
  ScaleIcon,
  UploadCloudIcon,
  UserRoundIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type PropertyType = "house-lot" | "raw-land";
type SellerRole = "owner" | "broker" | "proxy";
type Step = 3 | 4 | 5;

interface FieldState {
  lotArea: string;
  terrain: string;
  floorArea: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  yearBuilt: string;
  furnishing: string;
  titleType: string;
  titleNumber: string;
  scannedTitle: string;
  latestTaxReceipt: string;
  lotPlan: string;
  authorityToSell: string;
  sellingPrice: string;
  negotiability: string;
  taxResponsibilities: string;
  hoaDues: string;
}

const EMPTY_FIELDS: FieldState = {
  lotArea: "",
  terrain: "",
  floorArea: "",
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  yearBuilt: "",
  furnishing: "",
  titleType: "",
  titleNumber: "",
  scannedTitle: "",
  latestTaxReceipt: "",
  lotPlan: "",
  authorityToSell: "",
  sellingPrice: "",
  negotiability: "",
  taxResponsibilities: "",
  hoaDues: "",
};

const inputClassName =
  "w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--brand-core)] focus:ring-2 focus:ring-[var(--brand-core)]/10";

const STEPS: { value: Step; label: string }[] = [
  { value: 3, label: "Specifications" },
  { value: 4, label: "Legal & ownership" },
  { value: 5, label: "Pricing" },
];

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

function ToggleOption({
  active,
  onClick,
  icon: Icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof HomeIcon;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all sm:p-4 ${
        active
          ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 ring-2 ring-[var(--brand-core)]/10"
          : "border-[var(--border-light)] hover:border-[var(--brand-core)]/50"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-black text-[var(--text-primary)]">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] text-[var(--text-tertiary)]">
          {description}
        </span>
      </span>
    </button>
  );
}

function Stepper({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
}) {
  const step = (delta: number) => onChange(Math.max(0, value + delta));
  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
        {label} <span className="text-rose-500">*</span>
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => step(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-primary)] transition-colors hover:border-[var(--brand-core)] disabled:opacity-40"
          disabled={value <= 0}
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-lg font-black text-[var(--text-primary)]">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => step(1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] text-[var(--text-primary)] transition-colors hover:border-[var(--brand-core)]"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function FileUpload({
  label,
  required,
  fileName,
  onFile,
  hint,
}: {
  label: string;
  required?: boolean;
  fileName: string;
  onFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-light)] px-4 py-3 text-center transition-colors hover:border-[var(--brand-core)] hover:bg-[var(--brand-core)]/5">
        <input
          type="file"
          accept=".pdf,image/*"
          required={required}
          onChange={onFile}
          className="sr-only"
        />
        {fileName ? (
          <>
            <CheckIcon className="mb-1.5 h-5 w-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              File selected: {fileName}
            </span>
          </>
        ) : (
          <>
            <UploadCloudIcon className="mb-1.5 h-5 w-5 text-[var(--brand-core)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Upload file
            </span>
            <span className="mt-1 text-[10px] text-[var(--text-tertiary)]">
              PDF or image
            </span>
          </>
        )}
      </label>
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

/**
 * PropertyListingForm
 * ----------
 * Mock, backend-free form for property listing Steps 3-5.
 * - "Property Type" and "Seller Role" toggles are mock UI used to drive
 *   the branching logic below (no data is fetched or persisted).
 * - File inputs only store the selected file name in local state.
 *
 * Branching:
 * - Step 3 diverges on `propertyType`: House & Lot renders floor area,
 *   bedroom/bath + parking steppers, year built and furnishing. Raw Land
 *   hides all of those.
 * - Step 4 diverges on `sellerRole`: the "Authority to Sell / SPA" upload
 *   renders only when the seller is a Broker or Proxy (hidden for Owners).
 */
export default function PropertyListingForm() {
  const [step, setStep] = useState<Step>(3);
  const [propertyType, setPropertyType] = useState<PropertyType>("house-lot");
  const [sellerRole, setSellerRole] = useState<SellerRole>("owner");
  const [fields, setFields] = useState<FieldState>(EMPTY_FIELDS);

  const setField = <K extends keyof FieldState>(key: K, value: FieldState[K]) =>
    setFields((current) => ({ ...current, [key]: value }));

  const pickFile =
    (key: keyof FieldState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) setField(key, file.name);
    };

  /**
   * Auto-calculation (Step 5).
   * pricePerSqm = sellingPrice / lotArea, guarded against:
   * - empty lotArea ("" -> Number("") === 0)
   * - non-numeric input (Number() === NaN)
   * - division by zero / infinity
   * Any invalid state falls back to 0 so the read-only field shows "₱0.00".
   */
  const pricePerSqm = useMemo(() => {
    const lotArea = Number(fields.lotArea);
    const price = Number(fields.sellingPrice);
    if (!isFinite(lotArea) || !isFinite(price) || lotArea <= 0) return 0;
    return price / lotArea;
  }, [fields.lotArea, fields.sellingPrice]);

  const isHouseLot = propertyType === "house-lot";
  const needsAuthorityToSell = sellerRole !== "owner";

  const stepIndex = STEPS.findIndex((s) => s.value === step);

  const renderStep3 = () => (
    <form
      id="step-form"
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
        setStep(4);
      }}
    >
      <div>
        <SectionLabel>Property specifications</SectionLabel>
        <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
          Describe the property
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Measurements and physical characteristics of the lot
          {isHouseLot && " and home"}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lotArea"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            <RulerIcon className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
            Lot area (sqm) <span className="text-rose-500">*</span>
          </label>
          <input
            id="lotArea"
            type="number"
            min={0}
            required
            value={fields.lotArea}
            onChange={(event) => setField("lotArea", event.target.value)}
            className={inputClassName}
            placeholder="e.g. 120"
          />
          <FieldHint>
            Drives the price-per-sqm calculation in the pricing step.
          </FieldHint>
        </div>

        <div>
          <label
            htmlFor="terrain"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            Terrain / Topography <span className="text-rose-500">*</span>
          </label>
          <select
            id="terrain"
            required
            value={fields.terrain}
            onChange={(event) => setField("terrain", event.target.value)}
            className={inputClassName}
          >
            <option value="" disabled>
              Select terrain
            </option>
            <option value="Flat">Flat</option>
            <option value="Sloping">Sloping</option>
            <option value="Rolling">Rolling</option>
            <option value="Mountainous">Mountainous</option>
          </select>
        </div>
      </div>

      {/* House & Lot-only fields. Hidden entirely for Raw Land. */}
      {isHouseLot && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="floorArea"
                className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
              >
                <HomeIcon className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
                Floor area (sqm) <span className="text-rose-500">*</span>
              </label>
              <input
                id="floorArea"
                type="number"
                min={0}
                required
                value={fields.floorArea}
                onChange={(event) => setField("floorArea", event.target.value)}
                className={inputClassName}
                placeholder="e.g. 90"
              />
            </div>

            <div>
              <label
                htmlFor="yearBuilt"
                className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
              >
                Year built <span className="text-rose-500">*</span>
              </label>
              <input
                id="yearBuilt"
                type="number"
                min={1800}
                max={new Date().getFullYear()}
                required
                value={fields.yearBuilt}
                onChange={(event) => setField("yearBuilt", event.target.value)}
                className={inputClassName}
                placeholder="e.g. 2020"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Stepper
              label="Bedrooms"
              value={fields.bedrooms}
              onChange={(value) => setField("bedrooms", value)}
            />
            <Stepper
              label="Bathrooms"
              value={fields.bathrooms}
              onChange={(value) => setField("bathrooms", value)}
            />
            <Stepper
              label="Parking spaces"
              value={fields.parkingSpaces}
              onChange={(value) => setField("parkingSpaces", value)}
            />
          </div>

          <div>
            <label
              htmlFor="furnishing"
              className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
            >
              Furnishing <span className="text-rose-500">*</span>
            </label>
            <select
              id="furnishing"
              required
              value={fields.furnishing}
              onChange={(event) => setField("furnishing", event.target.value)}
              className={inputClassName}
            >
              <option value="" disabled>
                Select furnishing
              </option>
              <option value="Bare">Bare</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Fully Furnished">Fully Furnished</option>
            </select>
          </div>
        </>
      )}

      <StepNav step={step} onNext={() => setStep(4)} />
    </form>
  );

  const renderStep4 = () => (
    <form
      id="step-form"
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
        setStep(5);
      }}
    >
      <div>
        <SectionLabel>Legal & ownership documents</SectionLabel>
        <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
          Prove ownership
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Uploads are mocked in this stub — only the file name is kept locally.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="titleType"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            Title type <span className="text-rose-500">*</span>
          </label>
          <select
            id="titleType"
            required
            value={fields.titleType}
            onChange={(event) => setField("titleType", event.target.value)}
            className={inputClassName}
          >
            <option value="" disabled>
              Select title type
            </option>
            <option value="TCT">TCT (Transfer Certificate)</option>
            <option value="OCT">OCT (Original Certificate)</option>
            <option value="Tax Declaration">Tax Declaration</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="titleNumber"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            <FileTextIcon className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
            Title number <span className="text-rose-500">*</span>
          </label>
          <input
            id="titleNumber"
            required
            value={fields.titleNumber}
            onChange={(event) => setField("titleNumber", event.target.value)}
            className={inputClassName}
            placeholder="e.g. T-123456"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FileUpload
          label="Scanned title"
          required
          fileName={fields.scannedTitle}
          onFile={pickFile("scannedTitle")}
        />
        <FileUpload
          label="Latest tax receipt"
          required
          fileName={fields.latestTaxReceipt}
          onFile={pickFile("latestTaxReceipt")}
        />
        <FileUpload
          label="Lot plan / map"
          fileName={fields.lotPlan}
          onFile={pickFile("lotPlan")}
          hint="Optional. Helps buyers understand boundaries."
        />

        {/* Branching: SPA is only relevant when the seller is not the owner. */}
        {needsAuthorityToSell && (
          <FileUpload
            label="Authority to Sell / SPA"
            fileName={fields.authorityToSell}
            onFile={pickFile("authorityToSell")}
            hint={`Required from your role as ${sellerRole}.`}
          />
        )}
      </div>

      <StepNav
        step={step}
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
      />
    </form>
  );

  const renderStep5 = () => (
    <form
      id="step-form"
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div>
        <SectionLabel>Pricing & financial terms</SectionLabel>
        <h2 className="mt-2 text-lg font-black text-[var(--text-primary)]">
          Set the asking price
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Price per sqm is computed automatically from the lot area you entered.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sellingPrice"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            <ScaleIcon className="mr-1.5 inline h-3.5 w-3.5 text-[var(--brand-core)]" />{" "}
            Selling price (₱) <span className="text-rose-500">*</span>
          </label>
          <input
            id="sellingPrice"
            type="number"
            min={0}
            required
            value={fields.sellingPrice}
            onChange={(event) => setField("sellingPrice", event.target.value)}
            className={inputClassName}
            placeholder="e.g. 2400000"
          />
        </div>

        <div>
          <label
            htmlFor="pricePerSqm"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            Price per sqm{" "}
            <span className="font-normal text-[var(--text-tertiary)]">
              (auto)
            </span>
          </label>
          <div
            id="pricePerSqm"
            aria-live="polite"
            className={`${inputClassName} flex items-center bg-[var(--background-secondary)] text-base font-black text-[var(--brand-core)]`}
          >
            ₱
            {pricePerSqm.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <FieldHint>
            Selling price ÷ lot area. Shows ₱0.00 until a valid lot area is
            entered.
          </FieldHint>
        </div>
      </div>

      <div>
        <span className="mb-3 block text-sm font-bold text-[var(--text-primary)]">
          Negotiability <span className="text-rose-500">*</span>
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["Fixed", "Negotiable"] as const).map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                fields.negotiability === option
                  ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 ring-2 ring-[var(--brand-core)]/10"
                  : "border-[var(--border-light)] hover:border-[var(--brand-core)]/50"
              }`}
            >
              <input
                type="radio"
                name="negotiability"
                value={option}
                required
                checked={fields.negotiability === option}
                onChange={() => setField("negotiability", option)}
                className="sr-only"
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[var(--brand-core)]">
                {fields.negotiability === option && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-core)]" />
                )}
              </span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="taxResponsibilities"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            Tax responsibilities <span className="text-rose-500">*</span>
          </label>
          <select
            id="taxResponsibilities"
            required
            value={fields.taxResponsibilities}
            onChange={(event) =>
              setField("taxResponsibilities", event.target.value)
            }
            className={inputClassName}
          >
            <option value="" disabled>
              Select who pays taxes
            </option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
            <option value="Standard sharing">Standard sharing</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="hoaDues"
            className="mb-2 block text-sm font-bold text-[var(--text-primary)]"
          >
            HOA / Association dues{" "}
            <span className="font-normal text-[var(--text-tertiary)]">
              (Optional)
            </span>
          </label>
          <input
            id="hoaDues"
            type="number"
            min={0}
            value={fields.hoaDues}
            onChange={(event) => setField("hoaDues", event.target.value)}
            className={inputClassName}
            placeholder="e.g. 500"
          />
        </div>
      </div>

      <div className="flex w-full justify-end">
        <Button
          type="submit"
          fullWidth
          className="!h-12 rounded-2xl text-sm sm:w-auto sm:min-w-48"
        >
          <FileCheck2Icon className="h-4 w-4" /> Finish (stub)
        </Button>
      </div>
    </form>
  );

  return (
    <div className="w-full max-w-3xl p-2 text-left sm:p-4">
      <Card className="overflow-hidden border-[var(--border-light)] p-0 shadow-xl shadow-black/5">
        <div className="bg-[var(--brand-dark)] px-5 py-6 text-white sm:px-8 rounded-xl">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {isHouseLot ? "House & Lot" : "Raw Land"} listing
          </p>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">
            Complete your property details
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
            A mock, backend-free form. Use the toggles below to preview how the
            steps change for each property type and seller role.
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {/* Mock toggles driving all conditional rendering in this stub. */}
          <div className="mb-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Property type (mock)
              </p>
              <div className="grid gap-3">
                <ToggleOption
                  active={isHouseLot}
                  onClick={() => setPropertyType("house-lot")}
                  icon={HomeIcon}
                  label="House & Lot"
                  description="Home with its land included"
                />
                <ToggleOption
                  active={!isHouseLot}
                  onClick={() => setPropertyType("raw-land")}
                  icon={LandPlotIcon}
                  label="Raw Land"
                  description="Undeveloped parcel of land"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Seller role (mock)
              </p>
              <div className="grid gap-3">
                <ToggleOption
                  active={sellerRole === "owner"}
                  onClick={() => setSellerRole("owner")}
                  icon={UserRoundIcon}
                  label="Owner"
                  description="I own the property"
                />
                <ToggleOption
                  active={sellerRole === "broker"}
                  onClick={() => setSellerRole("broker")}
                  icon={UserRoundIcon}
                  label="Broker"
                  description="I represent the owner"
                />
                <ToggleOption
                  active={sellerRole === "proxy"}
                  onClick={() => setSellerRole("proxy")}
                  icon={UserRoundIcon}
                  label="Proxy"
                  description="I have permission to list"
                />
              </div>
            </div>
          </div>

          <Progress step={step} />

          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      </Card>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const stepIndex = STEPS.findIndex((s) => s.value === step);
  return (
    <div className="mb-7" aria-label={`Listing progress: step ${step} of 5`}>
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
        <span className="text-[var(--text-primary)]">Property listing</span>
        <span className="text-[var(--text-tertiary)]">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
        <div
          className="h-full rounded-full bg-[var(--brand-core)] transition-all duration-500"
          style={{
            width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-[var(--text-tertiary)]">
        {STEPS.map((s, i) => (
          <span
            key={s.value}
            className={i <= stepIndex ? "text-[var(--brand-core)]" : ""}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepNav({
  step,
  onBack,
  onNext,
}: {
  step: Step;
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {onBack ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="!h-12 rounded-2xl px-5 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" className="!h-12 rounded-2xl px-5 text-sm">
        Next <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
