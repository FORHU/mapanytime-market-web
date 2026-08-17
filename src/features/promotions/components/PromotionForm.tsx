"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Tag, Briefcase, Timer, Save, X } from "lucide-react";
import {
  useCreatePromotion,
  useUpdatePromotion,
} from "../hooks/usePromotionMutations";
import { ProductPickerField } from "./ProductPickerField";
import type {
  Promotion,
  PromotionKind,
  DiscountType,
  PromotionFields,
} from "../contracts/promotions.contract";

const KIND_OPTIONS: {
  value: PromotionKind;
  label: string;
  icon: typeof Tag;
}[] = [
  { value: "PROMO", label: "Product discount", icon: Tag },
  { value: "EVENT", label: "Limited-time & stock event", icon: Timer },
  { value: "JOB", label: "Job posting", icon: Briefcase },
];

const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "BOGO", label: "Buy X, get Y free" },
  { value: "PERCENTAGE", label: "% off" },
  { value: "FIXED_AMOUNT", label: "Fixed amount off" },
];

function Field({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function inputClass() {
  return "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:glow-primary";
}

function inputStyle() {
  return {
    background: "var(--background-secondary)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  } as const;
}

interface PromotionFormProps {
  storeId: string;
  promotion?: Promotion;
  onDone: () => void;
}

export function PromotionForm({
  storeId,
  promotion,
  onDone,
}: PromotionFormProps) {
  const isEditing = Boolean(promotion);
  const createMutation = useCreatePromotion(storeId);
  const updateMutation = useUpdatePromotion(storeId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [kind, setKind] = useState<PromotionKind>(promotion?.kind ?? "PROMO");
  const [title, setTitle] = useState(promotion?.title ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [badgeLabel, setBadgeLabel] = useState(promotion?.badgeLabel ?? "");
  const [ctaLabel, setCtaLabel] = useState(promotion?.ctaLabel ?? "");
  const [salaryLabel, setSalaryLabel] = useState(promotion?.salaryLabel ?? "");
  const [discountType, setDiscountType] = useState<DiscountType | "">(
    promotion?.discountType ?? "",
  );
  const [discountValue, setDiscountValue] = useState(
    promotion?.discountValue != null ? String(promotion.discountValue) : "",
  );
  const [buyQuantity, setBuyQuantity] = useState(
    promotion?.buyQuantity != null ? String(promotion.buyQuantity) : "",
  );
  const [freeQuantity, setFreeQuantity] = useState(
    promotion?.freeQuantity != null ? String(promotion.freeQuantity) : "",
  );
  const [expiresAt, setExpiresAt] = useState(
    promotion?.expiresAt ? promotion.expiresAt.slice(0, 10) : "",
  );
  const [productIds, setProductIds] = useState<string[]>(
    promotion?.products?.map((p) => p.productId) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiresProducts =
    kind === "EVENT" || (kind === "PROMO" && discountType !== "");

  const validate = (): PromotionFields | null => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!description.trim()) nextErrors.description = "Description is required";

    if (kind === "PROMO" && discountType === "BOGO") {
      if (!buyQuantity || Number(buyQuantity) < 1)
        nextErrors.buyQuantity = "Required";
      if (!freeQuantity || Number(freeQuantity) < 1)
        nextErrors.freeQuantity = "Required";
    }
    if (
      kind === "PROMO" &&
      (discountType === "PERCENTAGE" || discountType === "FIXED_AMOUNT")
    ) {
      if (!discountValue || Number(discountValue) <= 0)
        nextErrors.discountValue = "Required";
      if (discountType === "PERCENTAGE" && Number(discountValue) > 100)
        nextErrors.discountValue = "Must be 100 or less";
    }
    if (requiresProducts && productIds.length === 0) {
      nextErrors.products = "Select at least one product";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      kind,
      title: title.trim(),
      description: description.trim(),
      badgeLabel: badgeLabel.trim() || undefined,
      ctaLabel: ctaLabel.trim() || undefined,
      salaryLabel: kind === "JOB" ? salaryLabel.trim() || undefined : undefined,
      discountType: kind === "PROMO" && discountType ? discountType : undefined,
      discountValue:
        kind === "PROMO" &&
        (discountType === "PERCENTAGE" || discountType === "FIXED_AMOUNT")
          ? Number(discountValue)
          : undefined,
      buyQuantity:
        kind === "PROMO" && discountType === "BOGO"
          ? Number(buyQuantity)
          : undefined,
      freeQuantity:
        kind === "PROMO" && discountType === "BOGO"
          ? Number(freeQuantity)
          : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      products:
        productIds.length > 0
          ? productIds.map((productId) => ({ productId }))
          : undefined,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = validate();
    if (!payload) return;

    try {
      if (isEditing && promotion) {
        await updateMutation.mutateAsync({ id: promotion.id, payload });
        toast.success("Promotion updated");
      } else {
        await createMutation.mutateAsync({ ...payload, storeId });
        toast.success("Promotion created");
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {isEditing ? "Edit promotion" : "New promotion"}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Set up a discount, limited-time event, or job posting for your store.
        </p>
      </div>

      <Field label="Type" required>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {KIND_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              disabled={isEditing}
              onClick={() => setKind(value)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                border: `1px solid ${kind === value ? "var(--brand-core)" : "var(--border-default)"}`,
                background:
                  kind === value
                    ? "var(--brand-core)/10"
                    : "var(--background-secondary)",
                color:
                  kind === value ? "var(--brand-core)" : "var(--text-primary)",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Title" required error={errors.title}>
        <input
          className={inputClass()}
          style={inputStyle()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Buy 1 take 1 on iced coffee"
        />
      </Field>

      <Field label="Description" required error={errors.description}>
        <textarea
          className={inputClass()}
          style={inputStyle()}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers what this offer is about"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Badge label">
          <input
            className={inputClass()}
            style={inputStyle()}
            value={badgeLabel}
            onChange={(e) => setBadgeLabel(e.target.value)}
            placeholder="e.g. Hot deal"
          />
        </Field>
        <Field label="Call-to-action label">
          <input
            className={inputClass()}
            style={inputStyle()}
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="e.g. Shop now"
          />
        </Field>
      </div>

      {kind === "JOB" && (
        <Field label="Salary">
          <input
            className={inputClass()}
            style={inputStyle()}
            value={salaryLabel}
            onChange={(e) => setSalaryLabel(e.target.value)}
            placeholder="e.g. ₱15,000 - 20,000/mo"
          />
        </Field>
      )}

      {kind === "PROMO" && (
        <Field label="Discount type">
          <select
            className={inputClass()}
            style={inputStyle()}
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as DiscountType | "")
            }
          >
            <option value="">No discount</option>
            {DISCOUNT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {kind === "PROMO" && discountType === "BOGO" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Buy quantity" required error={errors.buyQuantity}>
            <input
              type="number"
              min={1}
              className={inputClass()}
              style={inputStyle()}
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
            />
          </Field>
          <Field label="Free quantity" required error={errors.freeQuantity}>
            <input
              type="number"
              min={1}
              className={inputClass()}
              style={inputStyle()}
              value={freeQuantity}
              onChange={(e) => setFreeQuantity(e.target.value)}
            />
          </Field>
        </div>
      )}

      {kind === "PROMO" &&
        (discountType === "PERCENTAGE" || discountType === "FIXED_AMOUNT") && (
          <Field
            label={
              discountType === "PERCENTAGE" ? "Discount (%)" : "Discount amount"
            }
            required
            error={errors.discountValue}
          >
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass()}
              style={inputStyle()}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </Field>
        )}

      <Field label="Expires on">
        <input
          type="date"
          className={inputClass()}
          style={inputStyle()}
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </Field>

      {requiresProducts && (
        <div>
          <ProductPickerField
            storeId={storeId}
            selectedProductIds={productIds}
            onChange={setProductIds}
            required={requiresProducts}
          />
          {errors.products && (
            <p className="mt-1 text-xs text-rose-500">{errors.products}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium"
          style={{
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--brand-core)" }}
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Create promotion"}
        </button>
      </div>
    </form>
  );
}
