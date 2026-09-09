"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Imported from their own paths rather than the `@/features/stores` barrel.
// That barrel also re-exports StoreOnboardingForm, which reaches MapSelection →
// mapbox-gl, so importing this small modal through it pulled the entire map
// engine into a page that has no map.
import { StoreTypeSelectionModal } from "@/features/stores/components/StoreTypeSelectionModal";
import type { StoreType } from "@/features/stores/types";
import StoreManagementDashboard, {
  type StoreItem,
} from "@/features/stores/components/StoreManagementDashboard";
import { useDeleteStore, useStores } from "@/features/stores/hooks/useStores";
import { formatTimeRemaining } from "@/features/stores/lib/deletionCountdown";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useProperties } from "@/features/properties/hooks/useProperties";
import type { StoreProperty } from "@/features/stores/contracts/manage-stores.contract";
import { useOrgContext } from "@/features/team";
import { isSellerRestricted } from "@/shared/lib/sellerVerification";
import {
  normalizeStoreStatus,
  storeBlockedReason,
  storeEntryRoute,
} from "@/shared/lib/storeApproval";
import { toast } from "sonner";

export default function ManageStoresPage() {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StoreItem | null>(null);
  const storesQuery = useStores();
  const propertiesQuery = useProperties();
  const router = useRouter();

  // One clock for every card, ticking each minute. Per-card intervals would be
  // one timer per rejected store, all redrawing the same page.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const deleteStore = useDeleteStore({
    onSuccess: (storeId) => {
      toast.success("Store deleted successfully.");
      setPendingDelete(null);

      // The seller may have been operating this store when they deleted it.
      // Leaving the id behind would point the whole seller shell at a store the
      // API now 404s, so clear it and navigate: `SellerLayout` re-reads the key
      // on a pathname change, and a bare localStorage write notifies nothing.
      if (localStorage.getItem("active_store_context_id") === storeId) {
        localStorage.removeItem("active_store_context_id");
        localStorage.removeItem("active_property_context_id");
        router.refresh();
      }
    },
  });

  // Belt and braces: `SellerAppLayout` already redirects an unverified seller
  // away from this page, and `POST /stores` refuses them regardless. This just
  // means the affordance is never offered if that redirect ever regresses.
  // Shares the layout's query key, so it costs no extra request.
  const orgQuery = useOrgContext();
  const canCreateStore = !isSellerRestricted(orgQuery.data?.sellerStatus);

  const isLoading = storesQuery.isLoading || propertiesQuery.isLoading;
  const isError = storesQuery.isError || propertiesQuery.isError;
  const error = storesQuery.error ?? propertiesQuery.error;

  const handleSelectStore = (storeId: string) => {
    const store = storesQuery.data?.find((s) => s.id === storeId);
    // Shares `normalizeStoreStatus` with the card badge, which is what the old
    // FIXME here was asking for: the guard used a bare `!== "ACTIVE"` while the
    // badge fell back to `isActive` for rows predating the column, so a legacy
    // store showed as Active and then refused to open.
    const status = normalizeStoreStatus(store?.approvalStatus, store?.isActive);

    // A store with changes requested has to be reachable — the seller was just
    // told to fix it. `storeEntryRoute` sends them to the profile editor rather
    // than a dashboard with nothing in it.
    const destination = storeEntryRoute(status);
    if (!destination) {
      toast.error(storeBlockedReason(status));
      return;
    }

    localStorage.setItem("active_store_context_id", storeId);
    localStorage.removeItem("active_property_context_id");
    router.push(destination);
  };

  const handleSelectStoreType = (type: StoreType) => {
    setShowTypeModal(false);
    router.push(`/seller/onboarding/${type}`);
  };

  const handleSelectProperty = (property: StoreProperty) => {
    if (property.status !== "ACTIVE") {
      toast.error("This property has not been verified yet.");
      return;
    }

    localStorage.setItem("active_property_context_id", property.id);
    localStorage.removeItem("active_store_context_id");
    router.push(`/seller/properties/${property.id}/dashboard`);
  };

  return (
    <div className="py-4">
      {isLoading && (
        <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">
          Loading your stores…
        </div>
      )}
      {isError && (
        <div className="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl text-left text-sm text-rose-700 dark:text-rose-300">
          <strong className="font-semibold">
            We couldn&apos;t load your stores.
          </strong>{" "}
          {error?.message}
        </div>
      )}
      {!isLoading && !isError && (
        <StoreManagementDashboard
          stores={(storesQuery.data ?? []).map((store) => ({
            id: store.id,
            storeName: store.storeName,
            isActive: store.isActive,
            approvalStatus: store.approvalStatus,
            rejectionReason: store.rejectionReason,
            revisionNotes: store.revisionNotes,
            scheduledDeletionAt: store.scheduledDeletionAt,
            city: store.storeLocations?.city,
            province: store.storeLocations?.province,
          }))}
          properties={(propertiesQuery.data ?? []).map((property) => ({
            id: property.id,
            propertyType: property.propertyType,
            status: property.status,
            rejectionReason: property.rejectionReason,
            address: property.address,
            subdivision: property.subdivision,
          }))}
          onSelectStore={handleSelectStore}
          onSelectProperty={handleSelectProperty}
          onCreateNewStore={
            canCreateStore ? () => setShowTypeModal(true) : undefined
          }
          onDeleteStore={setPendingDelete}
          now={now}
        />
      )}
      <StoreTypeSelectionModal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleSelectStoreType}
      />
      {/* Deletion is permanent and the store carries the seller's own work, so
          it never happens on a single click. */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this store?"
        description={deleteConfirmationMessage(pendingDelete, now)}
        confirmLabel="Delete store"
        variant="danger"
        isLoading={deleteStore.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteStore.mutate({ storeId: pendingDelete.id });
          }
        }}
      />
    </div>
  );
}

/**
 * Names the deadline the seller is bringing forward, so the dialog explains what
 * deleting now actually changes rather than only asking twice.
 */
function deleteConfirmationMessage(store: StoreItem | null, now: Date): string {
  const remaining = formatTimeRemaining(store?.scheduledDeletionAt, now);

  return remaining && remaining !== "any moment now"
    ? `${store?.storeName} was rejected and is scheduled for automatic deletion in ${remaining}. Deleting it now is permanent and cannot be undone.`
    : `${store?.storeName} was rejected. Deleting it is permanent and cannot be undone.`;
}
