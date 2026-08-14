"use client";

import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Pencil, Trash2 } from "lucide-react";
import {
  useDeletePromotion,
  useTogglePromotion,
} from "../hooks/usePromotionMutations";
import type { Promotion } from "../contracts/promotions.contract";

const KIND_LABEL: Record<Promotion["kind"], string> = {
  PROMO: "Discount",
  EVENT: "Limited event",
  JOB: "Job posting",
};

function discountSummary(promotion: Promotion) {
  if (
    promotion.discountType === "BOGO" &&
    promotion.buyQuantity &&
    promotion.freeQuantity
  ) {
    return `Buy ${promotion.buyQuantity}, get ${promotion.freeQuantity} free`;
  }
  if (promotion.discountType === "PERCENTAGE" && promotion.discountValue) {
    return `${promotion.discountValue}% off`;
  }
  if (promotion.discountType === "FIXED_AMOUNT" && promotion.discountValue) {
    return `₱${promotion.discountValue} off`;
  }
  return "—";
}

interface PromotionsTableProps {
  storeId: string;
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
}

export function PromotionsTable({
  storeId,
  promotions,
  onEdit,
}: PromotionsTableProps) {
  const toggleMutation = useTogglePromotion(storeId);
  const deleteMutation = useDeletePromotion(storeId);

  const handleToggle = (promotion: Promotion) => {
    toggleMutation.mutate(
      { id: promotion.id, isActive: !promotion.isActive },
      {
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Couldn't update"),
      },
    );
  };

  const handleDelete = (promotion: Promotion) => {
    if (!confirm(`Delete "${promotion.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(promotion.id, {
      onSuccess: () => toast.success("Promotion deleted"),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Couldn't delete promotion",
        ),
    });
  };

  return (
    <Card
      className="border border-[var(--border-default)] overflow-hidden shadow-sm !p-0"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="px-4 py-3.5">Title</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Details</th>
              <th className="px-4 py-3.5">Expires</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)] text-sm">
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td className="px-4 py-4 font-semibold text-[var(--text-primary)]">
                  {promotion.title}
                </td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">
                  {KIND_LABEL[promotion.kind]}
                </td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">
                  {promotion.kind === "JOB"
                    ? promotion.salaryLabel || "—"
                    : discountSummary(promotion)}
                </td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">
                  {promotion.expiresAt
                    ? new Date(promotion.expiresAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggle(promotion)}
                    disabled={toggleMutation.isPending}
                    className="rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                    style={{
                      background: promotion.isActive
                        ? "rgba(16,185,129,0.15)"
                        : "var(--background-tertiary)",
                      color: promotion.isActive
                        ? "rgb(5,150,105)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {promotion.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(promotion)}
                      className="rounded-lg p-1.5 hover:bg-[var(--background-tertiary)]"
                      aria-label="Edit"
                    >
                      <Pencil
                        className="h-4 w-4"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-1.5 hover:bg-[var(--background-tertiary)] disabled:opacity-60"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
