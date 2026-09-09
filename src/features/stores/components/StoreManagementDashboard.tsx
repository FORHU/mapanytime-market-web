"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { ClampedNote } from "@/shared/components/ui/ClampedNote";
import {
  StoreIcon,
  PlusIcon,
  ArrowRightIcon,
  MapPinIcon,
  HomeIcon,
  LandPlotIcon,
  Trash2Icon,
} from "lucide-react";
import type { StoreProperty } from "../contracts/manage-stores.contract";
import {
  STORE_STATUS_PRESENTATION,
  canOpenStore,
  normalizeStoreStatus,
} from "@/shared/lib/storeApproval";
import { deletionWarning } from "../lib/deletionCountdown";

export interface StoreItem {
  id: string;
  storeName: string;
  isActive: boolean;
  /**
   * Open string, narrowed by `normalizeStoreStatus`. Undefined on rows that
   * predate the column, which is why the fallback to `isActive` still matters.
   */
  approvalStatus?: string;
  rejectionReason?: string | null;
  revisionNotes?: string | null;
  /**
   * Server-computed deadline for a rejected store. Only ever displayed here —
   * the backend sweep is what actually deletes, so a card showing a stale
   * countdown is cosmetic, and one computing its own would be a second answer.
   */
  scheduledDeletionAt?: string | null;
  city?: string;
  province?: string;
}

interface StoreManagementDashboardProps {
  stores: StoreItem[];
  properties: StoreProperty[];
  onSelectStore: (storeId: string) => void;
  onSelectProperty: (property: StoreProperty) => void;
  /**
   * Omitted when the caller may not create a store — an unverified seller whose
   * application is still with an administrator. Both affordances disappear
   * rather than rendering a button that leads to a refusal.
   */
  onCreateNewStore?: () => void;
  /**
   * Omitted where deletion is not wired up. Only ever offered on a REJECTED
   * store; every other status has no delete affordance, and the endpoint refuses
   * them regardless of what this component renders.
   */
  onDeleteStore?: (store: StoreItem) => void;
  /**
   * Injected so the countdown can re-render on the parent's tick, and so tests
   * can pin it. Defaults to render time.
   */
  now?: Date;
}

export default function StoreManagementDashboard({
  stores,
  properties,
  onSelectStore,
  onSelectProperty,
  onCreateNewStore,
  onDeleteStore,
  now,
}: StoreManagementDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div>
          <h1 className="text-xl font-black tracking-tight text-text-primary">
            Manage Your Storefronts
          </h1>
          <p className="text-xs text-zinc-400">
            Select a secure isolated environment node to manage inventory,
            tracking pins, and S3 upload parameters.
          </p>
        </div>
        {onCreateNewStore && (
          <button
            onClick={onCreateNewStore}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" /> Add New Business
          </button>
        )}
      </div>

      {stores.length === 0 && properties.length === 0 ? (
        <Card className="p-12 text-center py-20 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <StoreIcon className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black mb-1">
            No Businesses or Properties Registered
          </h2>
          <p className="text-xs max-w-sm mx-auto text-zinc-400 mb-6">
            Initialize a business or property profile to start building your
            marketplace presence.
          </p>
          {onCreateNewStore && (
            <button
              onClick={onCreateNewStore}
              className="px-4 py-2 text-xs font-bold rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
              style={{ borderColor: "var(--border-light)" }}
            >
              Launch First Onboarding Manifest
            </button>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {stores.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-black text-text-primary">
                  Commerce Stores
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage inventory, orders, and store operations.
                </p>
              </div>
              {/* items-start: grid items stretch to the row's tallest card by
                  default, so expanding one store's rejection reason handed its
                  neighbour the same height — and the card's `justify-between`
                  turned that into a void above the neighbour's footer. Each
                  card sizes to its own content instead. */}
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                {stores.map((store) => {
                  // One resolution for the badge, the note and the footer, so
                  // the card cannot say "changes requested" while the footer
                  // invites the seller into a dashboard they cannot open.
                  const status = normalizeStoreStatus(
                    store.approvalStatus,
                    store.isActive,
                  );
                  const presentation = STORE_STATUS_PRESENTATION[status];
                  const StatusIcon = presentation.Icon;
                  const warning = deletionWarning(
                    store.scheduledDeletionAt,
                    now,
                  );

                  return (
                    <Card
                      key={store.id}
                      // min-w-0: a grid item defaults to `min-width: auto`, so an
                      // unbreakable name or note would otherwise widen the column
                      // and push the card out of the grid.
                      className="group flex min-w-0 cursor-pointer flex-col justify-between p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
                      style={{ borderColor: "var(--border-light)" }}
                      onClick={() => onSelectStore(store.id)}
                    >
                      <div className="min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              <StoreIcon className="h-4 w-4" />
                            </div>
                            <h3 className="min-w-0 break-words text-sm font-black tracking-tight text-text-primary transition-colors group-hover:text-brand-core">
                              {store.storeName}
                            </h3>
                          </div>
                          <span
                            className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${presentation.className}`}
                          >
                            <StatusIcon className="h-3 w-3 shrink-0" />
                            {presentation.label}
                          </span>
                        </div>
                        {(store.city || store.province) && (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                            <MapPinIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {[store.city, store.province]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                        {status === "REJECTED" && store.rejectionReason && (
                          <ClampedNote
                            label="Reason"
                            text={store.rejectionReason}
                            tone="danger"
                          />
                        )}
                        {status === "REJECTED" && warning && (
                          <p className="text-[11px] leading-4 text-rose-500">
                            {warning}
                          </p>
                        )}
                        {status === "NEEDS_REVISION" && store.revisionNotes && (
                          <ClampedNote
                            label="Changes requested"
                            text={store.revisionNotes}
                            tone="warning"
                          />
                        )}
                      </div>
                      <div
                        className="mt-4 flex items-center justify-between border-t pt-4 text-[11px] font-bold text-zinc-500"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        <span className="min-w-0">{presentation.nextStep}</span>
                        {/* The arrow promises the card goes somewhere, so it only
                          appears when it does — the other statuses answer a
                          click with an explanation, not a destination. */}
                        {canOpenStore(status) && (
                          <ArrowRightIcon className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                        )}
                        {/* Sits in the footer beside "Contact support to appeal":
                          the two are the seller's only options on a rejected
                          store, so they belong on the same row. Nothing else can
                          occupy this slot — `canOpenStore` is false for REJECTED,
                          so the arrow above never competes for it. */}
                        {status === "REJECTED" && onDeleteStore && (
                          <button
                            type="button"
                            // The whole card is clickable, so without this the
                            // delete would also open the store behind the dialog.
                            // Same trap ClampedNote documents.
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteStore(store);
                            }}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 text-[11px] font-bold text-rose-500 transition-colors hover:bg-rose-500/10"
                          >
                            <Trash2Icon className="h-3 w-3 shrink-0" />
                            Delete Store
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {properties.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-black text-text-primary">
                  House &amp; Lot Properties
                </h2>
                <p className="text-xs text-zinc-400">
                  Review your property onboarding drafts and verification
                  status.
                </p>
              </div>
              {/* Same reason as the stores grid above: these cards also carry a
                  rejection reason, so they have the identical defect waiting
                  for a long enough note. */}
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                {properties.map((property) => {
                  const isHouseLot = property.propertyType === "HOUSE_LOT";

                  return (
                    <Card
                      key={property.id}
                      className={`flex flex-col justify-between p-5 ${
                        property.status === "ACTIVE"
                          ? "cursor-pointer transition-colors hover:border-emerald-400"
                          : "cursor-not-allowed opacity-80"
                      }`}
                      style={{ borderColor: "var(--border-light)" }}
                      onClick={() => {
                        if (property.status === "ACTIVE") {
                          onSelectProperty(property);
                        }
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-core)]/10 text-[var(--brand-core)]">
                              {isHouseLot ? (
                                <HomeIcon className="h-4 w-4" />
                              ) : (
                                <LandPlotIcon className="h-4 w-4" />
                              )}
                            </div>
                            <h3 className="text-sm font-black tracking-tight text-text-primary">
                              {isHouseLot ? "House & Lot" : "Raw Land"}
                            </h3>
                          </div>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              property.status === "REJECTED"
                                ? "border-rose-500/20 bg-rose-500/5 text-rose-500"
                                : property.status === "ACTIVE"
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                                  : "border-amber-500/20 bg-amber-500/5 text-amber-500"
                            }`}
                          >
                            {property.status === "REJECTED"
                              ? "Rejected"
                              : property.status === "ACTIVE"
                                ? "Active"
                                : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-start gap-1 text-[10px] text-zinc-400">
                          <MapPinIcon className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>
                            {property.address}
                            {property.subdivision
                              ? `, ${property.subdivision}`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div
                        className="mt-4 flex items-center justify-between border-t pt-4 text-[11px] font-bold text-zinc-500"
                        style={{ borderColor: "var(--border-light)" }}
                      >
                        <span>Property onboarding draft</span>
                        <span className="max-w-[60%] text-right text-[10px] font-medium text-zinc-400">
                          {property.status === "REJECTED" &&
                          property.rejectionReason
                            ? `Reason: ${property.rejectionReason}`
                            : property.status === "ACTIVE"
                              ? "Verified"
                              : "Saved for review"}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
