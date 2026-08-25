"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Tag, Briefcase, Timer, Save, X } from "lucide-react";
import {
  useCreatePromotion,
  useUpdatePromotion,
} from "../hooks/usePromotionMutations";
import { ProductPickerField } from "./ProductPickerField";
import {
  DEFAULT_TIME_ZONE,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  MIN_WINDOW_MS,
  START_GRACE_MS,
  browserTimeZone,
  isoToWallClock,
  wallClockToIso,
  timeZoneAbbreviation,
  formatDuration,
  formatRelative,
  formatInZone,
} from "../lib/schedule";
import type {
  Promotion,
  PromotionKind,
  DiscountType,
  AdGoal,
  AdFormat,
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

const GOAL_OPTIONS: { value: AdGoal; label: string }[] = [
  { value: "STORE_VISITS", label: "Store visits" },
  { value: "IMPRESSIONS", label: "Impressions" },
  { value: "PURCHASES", label: "Purchases" },
];

const FORMAT_OPTIONS: { value: AdFormat; label: string }[] = [
  { value: "MAP_FLOATING_CARD", label: "Map card" },
  { value: "PROMOTED_PIN", label: "Promoted pin" },
  { value: "DISCOVERY_CAROUSEL", label: "Discovery carousel" },
  { value: "SPONSORED_SEARCH", label: "Sponsored search" },
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

interface MapSelectionProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  hint?: string;
}

interface PromotionFormProps {
  storeId: string;
  promotion?: Promotion;
  onDone: () => void;
  MapSelectionComponent: React.ComponentType<MapSelectionProps>;
}

export function PromotionForm({
  storeId,
  promotion,
  onDone,
  MapSelectionComponent,
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
  // The store's zone, not the browser's, is what every entered wall-clock time
  // means. It rides along on the promotion payload; new promotions fall back to
  // the platform default until the store's own zone is known.
  const timeZone = promotion?.storeTimezone ?? DEFAULT_TIME_ZONE;

  const initialStart = isoToWallClock(promotion?.startAt, timeZone);
  const initialEnd = isoToWallClock(promotion?.expiresAt, timeZone);

  const [startDate, setStartDate] = useState(initialStart.date);
  const [startTime, setStartTime] = useState(initialStart.time);
  const [expiresDate, setExpiresDate] = useState(initialEnd.date);
  const [expiresTime, setExpiresTime] = useState(initialEnd.time);
  const [goal, setGoal] = useState<AdGoal>(promotion?.goal ?? "STORE_VISITS");
  const [format, setFormat] = useState<AdFormat>(
    promotion?.format ?? "MAP_FLOATING_CARD",
  );
  const [radiusKm, setRadiusKm] = useState(
    promotion?.radiusKm != null ? String(promotion.radiusKm) : "",
  );
  const [targetLat, setTargetLat] = useState<number | undefined>(
    promotion?.targetLat ?? undefined,
  );
  const [targetLng, setTargetLng] = useState<number | undefined>(
    promotion?.targetLng ?? undefined,
  );
  const [dailyBudget, setDailyBudget] = useState(
    promotion?.dailyBudget != null ? String(promotion.dailyBudget) : "",
  );
  const [totalBudget, setTotalBudget] = useState(
    promotion?.totalBudget != null ? String(promotion.totalBudget) : "",
  );
  const [productIds, setProductIds] = useState<string[]>(
    promotion?.products?.map((p) => p.productId) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiresProducts =
    kind === "EVENT" || (kind === "PROMO" && discountType !== "");

  const viewerZone = browserTimeZone();
  const zoneDiffers = viewerZone !== timeZone;
  const zoneAbbr = timeZoneAbbreviation(timeZone);

  // A promotion already running can't have its start rewritten — impressions
  // and spend were attributed against the original one.
  const startLocked =
    promotion?.state === "LIVE" || promotion?.state === "ENDED";

  const startIso = wallClockToIso(
    startDate,
    startTime || DEFAULT_START_TIME,
    timeZone,
  );
  const expiresIso = wallClockToIso(
    expiresDate,
    expiresTime || DEFAULT_END_TIME,
    timeZone,
  );

  const setStartToNow = () => {
    const nowLocal = isoToWallClock(new Date().toISOString(), timeZone);
    setStartDate(nowLocal.date);
    setStartTime(nowLocal.time);
  };

  const validate = (): PromotionFields | null => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!description.trim()) nextErrors.description = "Description is required";

    // ── Schedule window ───────────────────────────────────────────────────
    if (startTime && !startDate) {
      nextErrors.startDate = "Pick a start date, or clear the time.";
    }
    if (expiresTime && !expiresDate) {
      nextErrors.expiresDate = "Pick an end date, or clear the time.";
    }

    if (startIso && expiresIso) {
      const durationMs =
        new Date(expiresIso).getTime() - new Date(startIso).getTime();

      if (durationMs <= 0) {
        nextErrors.expiresDate = `End time must be after the start time. Pick a time later than ${formatInZone(startIso, timeZone)}.`;
      } else if (durationMs < MIN_WINDOW_MS) {
        const minutes = Math.round(durationMs / 60000);
        nextErrors.expiresDate = `This promotion would run for ${minutes} minute${minutes === 1 ? "" : "s"}. Give it at least 5 minutes so it can be shown to buyers.`;
      }
    }

    // Only checked for a start the seller can still change: a running
    // promotion's start is in the past by definition.
    if (startIso && !startLocked) {
      const unchanged = promotion?.startAt
        ? new Date(promotion.startAt).getTime() === new Date(startIso).getTime()
        : false;

      if (
        !unchanged &&
        new Date(startIso).getTime() < Date.now() - START_GRACE_MS
      ) {
        nextErrors.startDate =
          "That start time has already passed. Pick a future time, or choose Start now.";
      }
    }

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
      // Both instants are resolved against the STORE's zone, not the browser's.
      // A seller travelling abroad must not write a different instant than the
      // same seller at their desk for the same picked time. Omitted entirely
      // when locked, so the server never sees an attempt to move a live start.
      ...(startLocked ? {} : { startAt: startIso ?? null }),
      expiresAt: expiresIso ?? null,
      goal,
      format,
      radiusKm: radiusKm ? Number(radiusKm) : undefined,
      targetLat,
      targetLng,
      dailyBudget: dailyBudget ? Number(dailyBudget) : undefined,
      totalBudget: totalBudget ? Number(totalBudget) : undefined,
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

      <fieldset
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--border-light)" }}
      >
        <legend className="px-1.5 text-sm font-medium text-[var(--text-primary)]">
          Schedule
        </legend>

        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Starts on" error={errors.startDate}>
              <input
                type="date"
                className={inputClass()}
                style={inputStyle()}
                value={startDate}
                disabled={startLocked}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="at">
              <input
                type="time"
                step={60}
                className={`${inputClass()} w-32`}
                style={inputStyle()}
                value={startTime}
                disabled={startLocked}
                placeholder={DEFAULT_START_TIME}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
          </div>

          {startLocked ? (
            <p className="text-xs text-[var(--text-secondary)]">
              This promotion has already started, so its start time is locked.
              You can still change when it ends.
            </p>
          ) : (
            <button
              type="button"
              onClick={setStartToNow}
              className="text-xs font-medium underline underline-offset-2"
              style={{ color: "var(--primary)" }}
            >
              Start now
            </button>
          )}

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Ends on" error={errors.expiresDate}>
              <input
                type="date"
                className={inputClass()}
                style={inputStyle()}
                value={expiresDate}
                onChange={(e) => setExpiresDate(e.target.value)}
              />
            </Field>
            <Field label="at">
              <input
                type="time"
                step={60}
                className={`${inputClass()} w-32`}
                style={inputStyle()}
                value={expiresTime}
                placeholder={DEFAULT_END_TIME}
                onChange={(e) => setExpiresTime(e.target.value)}
              />
            </Field>
          </div>

          <div className="space-y-1 text-xs text-[var(--text-secondary)]">
            <p>
              Times are in store time —{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {timeZone}
                {zoneAbbr && ` (${zoneAbbr})`}
              </span>
              .
            </p>
            {/* Shown only on mismatch. Displaying a conversion permanently
                trains sellers to distrust fields that are in fact correct. */}
            {zoneDiffers && (startIso || expiresIso) && (
              <p>
                Your device is on {viewerZone}, where this is{" "}
                {startIso && formatInZone(startIso, viewerZone)}
                {startIso && expiresIso && " to "}
                {expiresIso && formatInZone(expiresIso, viewerZone)}.
              </p>
            )}
            {!startDate && !expiresDate && (
              <p>Leave both blank to start immediately and run indefinitely.</p>
            )}
          </div>

          {/* Reads as a sentence, which catches an AM/PM slip or a wrong month
              faster than any validation rule. */}
          {startIso && expiresIso && !errors.expiresDate && (
            <p
              className="border-t pt-3 text-sm text-[var(--text-secondary)]"
              style={{ borderColor: "var(--border-light)" }}
            >
              Runs for{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {formatDuration(
                  new Date(expiresIso).getTime() - new Date(startIso).getTime(),
                )}
              </span>{" "}
              — starts {formatRelative(startIso)}.
            </p>
          )}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Goal">
          <select
            className={inputClass()}
            style={inputStyle()}
            value={goal}
            onChange={(e) => setGoal(e.target.value as AdGoal)}
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Placement">
          <select
            className={inputClass()}
            style={inputStyle()}
            value={format}
            onChange={(e) => setFormat(e.target.value as AdFormat)}
          >
            {FORMAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <MapSelectionComponent
          initialLat={targetLat}
          initialLng={targetLng}
          onChange={(lat, lng) => {
            setTargetLat(lat);
            setTargetLng(lng);
          }}
          label="Target area"
          hint="Where this ad should be centered. Leave unset to target your store's own location."
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Target radius (km)">
          <input
            type="number"
            min={1}
            max={50}
            className={inputClass()}
            style={inputStyle()}
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            placeholder="3"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Daily budget">
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass()}
            style={inputStyle()}
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
          />
        </Field>
        <Field label="Total budget">
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass()}
            style={inputStyle()}
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
          />
        </Field>
      </div>

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
