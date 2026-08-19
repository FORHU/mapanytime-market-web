"use client";

import React, { useMemo, useState } from "react";
import { Plus, Sparkles, Search, Store, Tag, Zap, Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { usePromotions } from "@/features/promotions/hooks/usePromotions";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";
import { PromotionsTable } from "@/features/promotions/components/PromotionsTable";
import { PromoteStoreWizardModal } from "@/features/promotions/components/PromoteStoreWizardModal";
import { BoostPromotionModal } from "@/features/promotions/components/BoostPromotionModal";
import type { Promotion } from "@/features/promotions/contracts/promotions.contract";

type PromotionStatusTab = "ACTIVE" | "SCHEDULED" | "DRAFTS" | "EXPIRED" | "ALL";

export default function PromotionsPage() {
  const { activeStoreId } = useActiveStore();
  const { data: stores } = useStoreProfiles();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const [boostingPromotion, setBoostingPromotion] = useState<Promotion | null>(
    null,
  );

  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<PromotionStatusTab>("ALL");

  const effectiveStoreId = activeStoreId || selectedStoreFilter || null;
  const activeStoreObj = stores?.find((s) => s.id === activeStoreId);

  const {
    data: promotions,
    isLoading,
    isError,
    error,
    refetch,
  } = usePromotions(effectiveStoreId);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const openForEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  // Filter promotions by search and status tab
  const filteredPromotions = useMemo(() => {
    if (!promotions) return [];
    return promotions.filter((p) => {
      // Search query
      if (
        searchQuery.trim() &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status tab
      const isExpired =
        p.expiresAt && new Date(p.expiresAt).getTime() < Date.now();

      if (statusTab === "ACTIVE") {
        return p.isActive && !isExpired;
      }
      if (statusTab === "EXPIRED") {
        return isExpired;
      }
      if (statusTab === "DRAFTS") {
        return !p.isActive && !isExpired;
      }
      if (statusTab === "SCHEDULED") {
        return false; // Available for future scheduled campaigns
      }
      return true;
    });
  }, [promotions, searchQuery, statusTab]);

  return (
    <div className="space-y-6 text-left">
      {/* ── Top Header and Action Buttons ─────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {activeStoreObj
              ? `${activeStoreObj.storeName} — Promotions & Ads`
              : "Promotions & Ads"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Drive local foot traffic and customer pickup with floating map
            cards, promoted pins, and discount offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            onClick={() => {
              setEditingPromotion(null);
              setIsFormOpen(true);
            }}
            className="!text-xs !px-3.5 !py-2 border shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Custom offer
          </Button>

          <Button
            onClick={() => setIsWizardOpen(true)}
            className="!text-xs !px-4 !py-2 bg-[var(--brand-core)] hover:opacity-90 text-white shadow-md flex items-center gap-1.5 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Promote this store
          </Button>
        </div>
      </div>

      {/* ── Filter Bar: Search, Store Dropdown, Status Tabs ──────────── */}
      <div className="space-y-3 bg-[var(--background-elevated)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search promotions by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors text-[var(--text-primary)]"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>

          {/* Store Filter (Only in All Stores mode) */}
          {!activeStoreId && (
            <div className="relative sm:w-52">
              <select
                aria-label="Filter by Store"
                value={selectedStoreFilter}
                onChange={(e) => setSelectedStoreFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Stores</option>
                {(stores ?? []).map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pt-1 pb-0.5 scrollbar-thin">
          {[
            { id: "ALL", label: "All promotions" },
            { id: "ACTIVE", label: "Active" },
            { id: "SCHEDULED", label: "Scheduled" },
            { id: "DRAFTS", label: "Drafts / Paused" },
            { id: "EXPIRED", label: "Expired" },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id as PromotionStatusTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[var(--brand-core)] border-[var(--brand-core)] text-white shadow-sm"
                    : "bg-[var(--background-secondary)] border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom Offer Form Modal ───────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-2xl bg-[var(--background-elevated)] border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {editingPromotion ? "Edit Offer" : "Create Custom Offer"}
              </h2>
              <button
                onClick={closeForm}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
              >
                ✕
              </button>
            </div>
            <PromotionForm
              storeId={effectiveStoreId || (stores && stores[0]?.id) || ""}
              promotion={editingPromotion ?? undefined}
              onDone={() => {
                closeForm();
                refetch();
              }}
            />
          </div>
        </div>
      )}

      {/* ── Promote Store Wizard Modal ────────────────────────────────── */}
      {isWizardOpen && (
        <PromoteStoreWizardModal
          storeId={effectiveStoreId}
          stores={stores}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Quick Boost Modal ─────────────────────────────────────────── */}
      {boostingPromotion && (
        <BoostPromotionModal
          promotion={boostingPromotion}
          onClose={() => setBoostingPromotion(null)}
        />
      )}

      {/* ── Main Promotions Table / State ─────────────────────────────── */}
      {isLoading && (
        <div className="animate-pulse p-8 text-center text-sm text-[var(--text-secondary)]">
          Loading promotions & discovery campaigns…
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

      {!isLoading && !isError && filteredPromotions.length === 0 && (
        <div
          className="rounded-2xl border border-dashed p-12 text-center text-sm text-[var(--text-secondary)] space-y-3 bg-[var(--background-secondary)]/30"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              No promotions found
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1">
              {searchQuery || statusTab !== "ALL"
                ? "No campaigns match your selected search or filter."
                : "Create your first discovery campaign or discount offer to stand out on the map."}
            </p>
          </div>
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="!text-xs bg-[var(--brand-core)] text-white shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Promote this store
          </Button>
        </div>
      )}

      {!isLoading && !isError && filteredPromotions.length > 0 && (
        <PromotionsTable
          storeId={effectiveStoreId}
          promotions={filteredPromotions}
          onEdit={openForEdit}
          onBoost={(p) => setBoostingPromotion(p)}
          showStoreColumn={!activeStoreId}
        />
      )}
    </div>
  );
}
