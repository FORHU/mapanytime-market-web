"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { Card } from "@/shared/components/ui/Card";
import { Home, KeyRound, Store, UploadCloud, CheckCircle2 } from "lucide-react";
import { MapSelection } from "./MapSelection";
import { Button } from "@/shared/components/ui/Button";
import { BackButton } from "@/shared/components/ui/BackButton";
import { ClearFormButton } from "@/shared/components/ui/ClearFormButton";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import { useCategories } from "../hooks/useCategories";
import { useCreateStore } from "../hooks/useCreateStore";
import type { StoreType } from "../types";
import {
  clearOnboardingDraft,
  getOnboardingDraftKey,
} from "../utils/onboardingDraft";

type DocumentField =
  "mayorsPermit" | "dtiCertificate" | "birCertificate" | "secCertificate";

const DOCUMENT_LABELS: Record<DocumentField, string> = {
  mayorsPermit: "Mayor's Business Permit",
  dtiCertificate: "DTI Registration Certificate",
  birCertificate: "BIR Certificate (2303)",
  secCertificate: "SEC Certificate",
};

const SHOW_DOCUMENT_UPLOAD_SECTION = false;

const DEFAULT_FORM_DATA = {
  storeName: "",
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
  mayorsPermitKey: "",
  mayorsPermitFileName: "",
  dtiCertificateKey: "",
  dtiCertificateFileName: "",
  birCertificateKey: "",
  birCertificateFileName: "",
  secCertificateKey: "",
  secCertificateFileName: "",
};

export default function StoreOnboardingForm({
  onComplete,
  storeType,
  onBack,
}: {
  onComplete: () => void;
  storeType?: StoreType;
  onBack?: () => void;
}) {
  const draftStorageKey = getOnboardingDraftKey(storeType);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const draftLoadedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [isDone, setIsDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        setFormData({ ...DEFAULT_FORM_DATA, ...JSON.parse(savedDraft) });
      }
    } catch {
      // Ignore unavailable or malformed browser storage and use empty defaults.
    } finally {
      draftLoadedRef.current = true;
      setIsDraftLoaded(true);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!isDraftLoaded || !draftLoadedRef.current) return;
    localStorage.setItem(draftStorageKey, JSON.stringify(formData));
  }, [draftStorageKey, formData, isDraftLoaded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOnboardingDraft(storeType);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [storeType]);

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const mayorsPermitUpload = useS3AssetUpload("compliance");
  const dtiCertificateUpload = useS3AssetUpload("compliance");
  const birCertificateUpload = useS3AssetUpload("compliance");
  const secCertificateUpload = useS3AssetUpload("compliance");

  const uploadsByField: Record<DocumentField, typeof mayorsPermitUpload> = {
    mayorsPermit: mayorsPermitUpload,
    dtiCertificate: dtiCertificateUpload,
    birCertificate: birCertificateUpload,
    secCertificate: secCertificateUpload,
  };
  const uploadingField = (Object.keys(uploadsByField) as DocumentField[]).find(
    (field) => uploadsByField[field].isPending,
  );

  const storeTypeLabel = {
    store: "Store",
    "house-lot": "House or Lot",
    renting: "Renting",
  } satisfies Record<StoreType, string>;
  const StoreTypeIcon =
    storeType === "house-lot"
      ? Home
      : storeType === "renting"
        ? KeyRound
        : Store;

  const onboardMutation = useCreateStore({
    onValidationError: setFieldErrors,
    onSuccess: () => {
      clearForm();
      setIsDone(true);
      setTimeout(onComplete, 1500);
    },
  });

  const clearForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFieldErrors({});
    setIsDone(false);
    formRef.current?.reset();
    clearOnboardingDraft(storeType);
    onboardMutation.reset();
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: DocumentField,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadsByField[fieldName].mutate(file, {
      onSuccess: (data) =>
        setFormData((prev) => ({
          ...prev,
          [`${fieldName}Key`]: data.fileKey,
          [`${fieldName}FileName`]: data.fileName,
        })),
    });
  };

  const handleOnboardSubmit = (e: FormEvent) => {
    e.preventDefault();
    onboardMutation.mutate(formData);
  };

  if (isDone) {
    return (
      <Card className="max-w-xl mx-auto p-8 text-center space-y-4 py-16">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-lg font-black">Store Created!</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Your store details and spatial node configuration are locked in.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 text-left">
      <Card className="p-6">
        {onBack && <BackButton onClick={onBack} className="-ml-2 mb-3" />}
        <div
          className="mb-6 flex items-center gap-3 pb-4 border-b"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-colors"
            style={{ backgroundColor: "var(--brand-dark)" }}
          >
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black">Merchant Store Onboarding</h2>
            <p className="text-[11px] text-zinc-400">
              Establish storefront settings and upload secure registry data
              vectors
            </p>
          </div>
        </div>

        {storeType && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--brand-core)]/20 bg-[var(--brand-core)]/5 px-3 py-2 text-xs text-[var(--text-secondary)]">
            <StoreTypeIcon className="h-4 w-4 text-[var(--brand-core)]" />
            <span>
              Setting up:{" "}
              <strong className="text-[var(--text-primary)]">
                {storeTypeLabel[storeType]}
              </strong>
            </span>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleOnboardSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                required
                placeholder="e.g., Baguio Hyperlocal Traders"
                value={formData.storeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-light)" }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Store Type Category
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleInputChange}
                disabled={categoriesLoading || categoriesError}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-[var(--background-primary)] focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--border-light)" }}
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? "Loading categories..."
                    : categoriesError
                      ? "Unable to load categories"
                      : "Select a category"}
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <p className="text-[10px] text-rose-500">
                  Could not load store categories from the server. Reload the
                  page to try again.
                </p>
              )}
            </div>
          </div>

          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <h3 className="text-xs font-black tracking-tight mb-4 text-[var(--text-secondary)] uppercase">
              Store Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Store Street Address
                </label>
                <input
                  type="text"
                  name="currentAddress"
                  required
                  placeholder="Street, building, unit"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Business Mailing Address
                </label>
                <input
                  type="text"
                  name="homeAddress"
                  required
                  placeholder="Registered business mailing address"
                  value={formData.homeAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <MapSelection
                  initialLat={formData.lat}
                  initialLng={formData.lng}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </div>

          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <h3 className="text-xs font-black tracking-tight mb-4 text-[var(--text-secondary)] uppercase">
              Operating Hours
            </h3>
            <p className="text-[10px] text-zinc-400 -mt-2 mb-3">
              Applies to every day the store is open.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Open Time
                </label>
                <input
                  type="time"
                  name="openTime"
                  required
                  value={formData.openTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Close Time
                </label>
                <input
                  type="time"
                  name="closeTime"
                  required
                  value={formData.closeTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-all text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
            </div>
          </div>

          {SHOW_DOCUMENT_UPLOAD_SECTION && (
            <div
              className="pt-2 border-t"
              style={{ borderColor: "var(--border-light)" }}
            >
              <h3 className="text-xs font-black tracking-tight mb-4 text-[var(--text-secondary)] uppercase">
                Compliance Verification Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(DOCUMENT_LABELS) as DocumentField[]).map(
                  (field) => (
                    <div className="space-y-1" key={field}>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {DOCUMENT_LABELS[field]}
                      </label>
                      <div
                        className="relative flex items-center justify-center border border-dashed rounded-xl p-3 bg-[var(--background-secondary)] cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, field)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          disabled={Boolean(uploadingField)}
                        />
                        <div className="text-center text-[11px] text-zinc-500 flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-zinc-400" />
                          <span>
                            {uploadingField === field
                              ? "Streaming..."
                              : formData[`${field}Key`]
                                ? "✓ Attached"
                                : "Select File"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {Object.keys(fieldErrors).length > 0 && (
            <div
              className="rounded-xl border p-3 text-[11px] text-rose-500 space-y-0.5"
              style={{ borderColor: "var(--border-light)" }}
            >
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <p key={field}>
                  {field}: {messages.join(", ")}
                </p>
              ))}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={onboardMutation.isPending}
            isLoading={onboardMutation.isPending}
            className="!h-11 mt-4 text-xs font-bold rounded-xl"
          >
            {onboardMutation.isPending
              ? "Submitting..."
              : "Submit Store Onboarding Data"}
          </Button>
          <div className="flex justify-center pt-1">
            <ClearFormButton onClear={clearForm} />
          </div>
        </form>
      </Card>
    </div>
  );
}
