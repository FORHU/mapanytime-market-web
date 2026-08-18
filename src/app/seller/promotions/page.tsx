"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { usePromotions } from "@/features/promotions/hooks/usePromotions";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";
import { PromotionsTable } from "@/features/promotions/components/PromotionsTable";
import type { Promotion } from "@/features/promotions/contracts/promotions.contract";

export default function PromotionsPage() {
  const { activeStoreId } = useActiveStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );

  const {
    data: promotions,
    isLoading,
    isError,
    error,
  } = usePromotions(activeStoreId);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const openForEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between border-b pb-4"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Promotions & ads
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Set up discounts, limited-time stock events, and job postings for
            your store.
          </p>
        </div>
        <button
          onClick={() => (isFormOpen ? closeForm() : setIsFormOpen(true))}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--brand-core)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          {isFormOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isFormOpen ? "Cancel" : "New promotion"}
        </button>
      </div>

      {!activeStoreId && (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-[var(--text-secondary)]">
          Select a store first to manage its promotions.
        </div>
      )}

      {activeStoreId && isFormOpen && (
        <PromotionForm
          storeId={activeStoreId}
          promotion={editingPromotion ?? undefined}
          onDone={closeForm}
        />
      )}

      {activeStoreId && !isFormOpen && (
        <>
          {isLoading && (
            <div className="animate-pulse p-8 text-center text-sm text-[var(--text-secondary)]">
              Loading your promotions…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-left text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300">
              <strong className="font-semibold">
                We couldn&apos;t load your promotions.
              </strong>{" "}
              {error?.message}
            </div>
          )}

          {!isLoading && !isError && promotions && promotions.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center text-sm text-[var(--text-secondary)]">
              You haven&apos;t created any promotions yet. Tap &quot;New
              promotion&quot; to set up your first discount, event, or job
              posting.
            </div>
          )}

          {!isLoading && !isError && promotions && promotions.length > 0 && (
            <PromotionsTable
              storeId={activeStoreId}
              promotions={promotions}
              onEdit={openForEdit}
            />
          )}
        </>
      )}
    </div>
  );
}
