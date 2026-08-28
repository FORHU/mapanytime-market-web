"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  Check,
  Plus,
  Edit2,
  Ticket,
  Power,
  Percent,
} from "lucide-react";
import {
  useAdminRewardConfig,
  useUpdateRewardConfig,
  useAdminVouchers,
  useAdminVoucherActions,
} from "@/features/adminRewards/hooks/useAdminRewards";
import type {
  AdminVoucher,
  CreateVoucherInput,
  RewardDiscountType,
} from "@/features/adminRewards/contracts/adminRewards.contract";

const inputClass =
  "w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]";
const labelClass =
  "block text-xs font-bold text-[var(--text-secondary)] mb-1.5";

function RewardConfigPanel() {
  const { data: config, isLoading, isError } = useAdminRewardConfig();
  const { mutate, isPending, error } = useUpdateRewardConfig();

  // Percent as a display string ("0.1" for 0.1%) — the API deals in the raw
  // fraction (0.001). Kept separate from the fraction so the input doesn't
  // fight floating-point round-tripping while the admin is typing.
  const [earnPercentDisplay, setEarnPercentDisplay] = useState("0.1");
  const [pointValueInPhp, setPointValueInPhp] = useState("0.1");
  const [expirationMonths, setExpirationMonths] = useState("12");
  const [isEarningActive, setIsEarningActive] = useState(true);
  const [changeReason, setChangeReason] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!config) return;
    setEarnPercentDisplay(String(config.earnPercentage * 100));
    setPointValueInPhp(String(config.pointValueInPhp));
    setExpirationMonths(String(config.expirationMonths));
    setIsEarningActive(config.isEarningActive);
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const earnPercentage = Number(earnPercentDisplay) / 100;
    const pointValue = Number(pointValueInPhp);
    const months = Number(expirationMonths);
    if (
      !Number.isFinite(earnPercentage) ||
      earnPercentage < 0 ||
      !Number.isFinite(pointValue) ||
      pointValue <= 0 ||
      !Number.isInteger(months) ||
      months <= 0
    ) {
      return;
    }

    setSaved(false);
    mutate(
      {
        earnPercentage,
        pointValueInPhp: pointValue,
        expirationMonths: months,
        isEarningActive,
        changeReason: changeReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setChangeReason("");
          setSaved(true);
        },
      },
    );
  };

  return (
    <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Earn rate
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Proportional to eligible spend (subtotal minus discount), rounded to
          the nearest whole point at order completion — not a fixed-₱ floor.
          {config && !isLoading && !isError && (
            <>
              {" "}
              Currently version {config.version}, active since{" "}
              {new Date(config.createdAt).toLocaleDateString()}.
            </>
          )}
          {!config && !isLoading && !isError && (
            <>
              {" "}
              No config has ever been saved — the platform is running on
              hardcoded defaults (0.1% earn rate, ₱0.10/point, 12-month expiry)
              until you save one here.
            </>
          )}
        </p>
      </div>

      {isLoading && (
        <div className="h-40 rounded-2xl bg-[var(--background-tertiary)]/40 animate-pulse" />
      )}

      {isError && (
        <p className="text-xs font-bold text-rose-400">
          Could not load the reward config. Please try again.
        </p>
      )}

      {!isLoading && !isError && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="earn-percent" className={labelClass}>
                Earn rate (% of eligible spend)
              </label>
              <div className="relative">
                <input
                  id="earn-percent"
                  type="number"
                  step="0.001"
                  min="0"
                  value={earnPercentDisplay}
                  onChange={(e) => setEarnPercentDisplay(e.target.value)}
                  className={`${inputClass} pr-8`}
                />
                <Percent className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              </div>
            </div>

            <div>
              <label htmlFor="point-value" className={labelClass}>
                Point value (₱ per point)
              </label>
              <input
                id="point-value"
                type="number"
                step="0.01"
                min="0.01"
                value={pointValueInPhp}
                onChange={(e) => setPointValueInPhp(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="expiration-months" className={labelClass}>
                Point expiry (months)
              </label>
              <input
                id="expiration-months"
                type="number"
                step="1"
                min="1"
                value={expirationMonths}
                onChange={(e) => setExpirationMonths(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEarningActive((v) => !v)}
              aria-pressed={isEarningActive}
              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                isEarningActive
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-[var(--background-primary)] border border-[var(--border-default)] text-transparent hover:border-cyan-400"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Earning is {isEarningActive ? "active" : "paused"}
            </span>
          </div>

          <div>
            <label htmlFor="change-reason" className={labelClass}>
              Change reason{" "}
              <span className="font-normal">
                (optional, kept in the audit trail)
              </span>
            </label>
            <input
              id="change-reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Q4 promo — temporary rate bump"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400">
              {error instanceof Error
                ? error.message
                : "Could not save the config."}
            </p>
          )}
          {saved && !isPending && (
            <p className="text-xs font-bold text-emerald-400">
              Saved as a new config version.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-core)] text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isPending ? "Saving..." : "Save config"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const emptyVoucherForm: CreateVoucherInput = {
  title: "",
  description: "",
  pointCost: 100,
  discountType: "FIXED",
  discountValue: 10,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  validityDays: 30,
  totalStock: undefined,
  isActive: true,
};

function VoucherForm({
  initial,
  submitLabel,
  pendingLabel,
  isPending,
  onCancel,
  onSubmit,
}: {
  initial: CreateVoucherInput;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateVoucherInput) => void;
}) {
  const [form, setForm] = useState(initial);

  const set = <K extends keyof CreateVoucherInput>(
    key: K,
    value: CreateVoucherInput[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !form.title.trim() ||
          form.pointCost <= 0 ||
          form.discountValue <= 0
        )
          return;
        onSubmit({
          ...form,
          title: form.title.trim(),
          description: form.description?.trim() || undefined,
        });
      }}
      className="w-full max-w-lg rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 space-y-4 max-h-[85vh] overflow-y-auto"
    >
      <h2 className="text-lg font-black text-[var(--text-primary)]">
        {submitLabel}
      </h2>

      <div>
        <label htmlFor="v-title" className={labelClass}>
          Title
        </label>
        <input
          id="v-title"
          autoFocus
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="v-desc" className={labelClass}>
          Description <span className="font-normal">(optional)</span>
        </label>
        <input
          id="v-desc"
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="v-cost" className={labelClass}>
            Point cost
          </label>
          <input
            id="v-cost"
            type="number"
            min="1"
            step="1"
            value={form.pointCost}
            onChange={(e) => set("pointCost", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="v-stock" className={labelClass}>
            Total stock <span className="font-normal">(blank = unlimited)</span>
          </label>
          <input
            id="v-stock"
            type="number"
            min="1"
            step="1"
            value={form.totalStock ?? ""}
            onChange={(e) =>
              set(
                "totalStock",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="v-discount-type" className={labelClass}>
            Discount type
          </label>
          <select
            id="v-discount-type"
            value={form.discountType}
            onChange={(e) =>
              set("discountType", e.target.value as RewardDiscountType)
            }
            className={inputClass}
          >
            <option value="FIXED">Fixed ₱ off</option>
            <option value="PERCENTAGE">% off</option>
          </select>
        </div>
        <div>
          <label htmlFor="v-discount-value" className={labelClass}>
            Discount value {form.discountType === "PERCENTAGE" ? "(%)" : "(₱)"}
          </label>
          <input
            id="v-discount-value"
            type="number"
            min="0"
            step="0.01"
            value={form.discountValue}
            onChange={(e) => set("discountValue", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="v-min-order" className={labelClass}>
            Min order ₱ <span className="font-normal">(optional)</span>
          </label>
          <input
            id="v-min-order"
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount ?? ""}
            onChange={(e) =>
              set(
                "minOrderAmount",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            className={inputClass}
          />
        </div>
        {form.discountType === "PERCENTAGE" && (
          <div>
            <label htmlFor="v-max-discount" className={labelClass}>
              Max discount ₱ <span className="font-normal">(optional)</span>
            </label>
            <input
              id="v-max-discount"
              type="number"
              min="0"
              step="0.01"
              value={form.maxDiscountAmount ?? ""}
              onChange={(e) =>
                set(
                  "maxDiscountAmount",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="v-validity" className={labelClass}>
          Validity after claim (days)
        </label>
        <input
          id="v-validity"
          type="number"
          min="1"
          step="1"
          value={form.validityDays ?? 30}
          onChange={(e) => set("validityDays", Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

function VoucherCatalogPanel() {
  const { data, isLoading, isError, error } = useAdminVouchers();
  const { create, update, toggleActive } = useAdminVoucherActions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<AdminVoucher | null>(null);

  const vouchers = data ?? [];

  const mutationErrorMessage = [create.error, update.error, toggleActive.error]
    .filter(Boolean)
    .map((e) =>
      e instanceof Error ? e.message : "That change could not be saved.",
    )
    .at(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[var(--brand-core)]" />
            Voucher catalog
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {vouchers.length} voucher{vouchers.length === 1 ? "" : "s"} in the
            catalog. Vouchers can&apos;t be deleted once claimed against —
            deactivate them instead.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-core)] text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" /> New voucher
        </button>
      </div>

      {mutationErrorMessage && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-xs text-rose-400">
          {mutationErrorMessage}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-400">
          <p className="font-bold mb-1">Could not load vouchers.</p>
          <p className="text-xs opacity-80">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </div>
      )}

      {!isLoading && !isError && vouchers.length === 0 && (
        <div className="p-12 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-center">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)] opacity-40" />
          <p className="font-bold text-[var(--text-primary)]">
            No vouchers yet
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Add the first one for buyers to redeem MapPoints against.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {vouchers.map((voucher) => {
          const stockLabel =
            voucher.totalStock == null
              ? "Unlimited stock"
              : `${voucher.claimedCount}/${voucher.totalStock} claimed`;
          const discountLabel =
            voucher.discountType === "FIXED"
              ? `₱${voucher.discountValue} off`
              : `${voucher.discountValue}% off${
                  voucher.maxDiscountAmount
                    ? ` (max ₱${voucher.maxDiscountAmount})`
                    : ""
                }`;

          return (
            <div
              key={voucher.id}
              className={`flex items-center justify-between gap-4 p-5 rounded-2xl border bg-[var(--background-secondary)]/50 backdrop-blur-md ${
                voucher.isActive
                  ? "border-[var(--border-default)]"
                  : "border-[var(--border-default)] opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-bold text-[var(--text-primary)] truncate">
                  {voucher.title}
                </p>
                {voucher.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                    {voucher.description}
                  </p>
                )}
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] mt-1 uppercase tracking-wide">
                  {voucher.pointCost} pts · {discountLabel} · {stockLabel} ·{" "}
                  {voucher.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditing(voucher)}
                  aria-label={`Edit ${voucher.title}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    toggleActive.mutate({
                      id: voucher.id,
                      isActive: !voucher.isActive,
                    })
                  }
                  disabled={toggleActive.isPending}
                  aria-label={
                    voucher.isActive
                      ? `Deactivate ${voucher.title}`
                      : `Activate ${voucher.title}`
                  }
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
                    voucher.isActive
                      ? "text-rose-400 hover:bg-rose-500/10"
                      : "text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <VoucherForm
            initial={emptyVoucherForm}
            submitLabel="Create voucher"
            pendingLabel="Creating..."
            isPending={create.isPending}
            onCancel={() => setShowAddModal(false)}
            onSubmit={(input) =>
              create.mutate(input, { onSuccess: () => setShowAddModal(false) })
            }
          />
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <VoucherForm
            initial={{
              title: editing.title,
              description: editing.description ?? "",
              pointCost: editing.pointCost,
              discountType: editing.discountType,
              discountValue: editing.discountValue,
              minOrderAmount: editing.minOrderAmount ?? undefined,
              maxDiscountAmount: editing.maxDiscountAmount ?? undefined,
              validityDays: editing.validityDays,
              totalStock: editing.totalStock ?? undefined,
              isActive: editing.isActive,
            }}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            isPending={update.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(input) =>
              update.mutate(
                { id: editing.id, input },
                { onSuccess: () => setEditing(null) },
              )
            }
          />
        </div>
      )}
    </div>
  );
}

export default function AdminRewardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
          <Coins className="w-7 h-7 text-[var(--brand-core)]" />
          MapPoints
        </h1>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
          Buyer loyalty points: the earn rate buyers accrue at, and the voucher
          catalog they redeem points against.
        </p>
      </div>

      <RewardConfigPanel />
      <VoucherCatalogPanel />
    </div>
  );
}
