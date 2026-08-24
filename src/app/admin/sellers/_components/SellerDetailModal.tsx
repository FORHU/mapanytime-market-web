"use client";

import { useGetSellerDetail } from "@/features/adminSellers/hooks";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { X } from "lucide-react";
import { format } from "date-fns";

interface SellerDetailModalProps {
  sellerId: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

type PillVariant = "success" | "warning" | "error" | "info";

const statusVariant = (status: string): PillVariant => {
  const s = status.toUpperCase();
  if (["APPROVED", "ACTIVE", "VERIFIED"].includes(s)) return "success";
  if (s === "PENDING") return "warning";
  if (["REJECTED", "SUSPENDED"].includes(s)) return "error";
  return "info";
};

export default function SellerDetailModal({
  sellerId,
  onClose,
  onApprove,
  onReject,
}: SellerDetailModalProps) {
  const {
    data: seller,
    isLoading,
    isError,
    error,
  } = useGetSellerDetail(sellerId);

  // Loading and failure both have to render the shell. Returning null on error
  // made the modal silently vanish while the parent still believed it was open.
  if (isLoading || !seller) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl mx-4">
          {isLoading ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              Loading...
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-medium text-[var(--md-sys-color-error)]">
                Could not load this seller.
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {isError && error instanceof Error
                  ? error.message
                  : "Please close this dialog and try again."}
              </p>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    [seller.firstName, seller.lastName].filter(Boolean).join(" ") || "—";
  const wasRejected = seller.applicationStatus === "REJECTED";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {fullName}
            </h2>
            <p className="text-[var(--text-secondary)]">{seller.email}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close seller details"
            className="rounded-xl p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[var(--border-default)]">
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Phone
              </label>
              <p className="font-medium">{seller.phoneNumber || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Applied
              </label>
              <p className="font-medium">
                {format(new Date(seller.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Stores
              </label>
              <p className="font-medium">{seller.stores.length}</p>
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)]">
                Documents
              </label>
              <p className="font-medium">
                {seller.documentVerifications.length}
              </p>
            </div>
          </div>

          {/* Stores */}
          {seller.stores.length > 0 && (
            <div className="pb-6 border-b border-[var(--border-default)]">
              <h3 className="font-semibold mb-3">Stores</h3>
              <div className="space-y-2">
                {seller.stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex justify-between items-center p-3 bg-[var(--background-secondary)] rounded-xl"
                  >
                    <span>{store.storeName}</span>
                    <StatusPill
                      label={store.approvalStatus}
                      variant={statusVariant(store.approvalStatus)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {seller.documentVerifications.length > 0 && (
            <div className="pb-6 border-b border-[var(--border-default)]">
              <h3 className="font-semibold mb-3">Documents</h3>
              <div className="space-y-2">
                {seller.documentVerifications.map((dv) => (
                  <div
                    key={dv.id}
                    className="p-3 bg-[var(--background-secondary)] rounded-xl"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        Verification {dv.id.slice(0, 8)}
                      </span>
                      <StatusPill
                        label={dv.status}
                        variant={statusVariant(dv.status)}
                      />
                    </div>
                    {dv.documents.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {dv.documents.map((doc) => (
                          <li
                            key={doc.id}
                            className="rounded-full border border-[var(--border-default)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                          >
                            {doc.type}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-[var(--text-secondary)]">
                        No documents uploaded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review history — reject writes these fields too, so the labels
              follow the outcome rather than assuming approval. */}
          {seller.reviewedAt && (
            <div className="pb-6 border-b border-[var(--border-default)]">
              <h3 className="font-semibold mb-3">Review History</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">
                    Status
                  </label>
                  <p className="font-medium capitalize">
                    {seller.applicationStatus.toLowerCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">
                    {wasRejected ? "Rejected by" : "Approved by"}
                  </label>
                  <p className="font-medium">
                    {seller.reviewedBy?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)]">
                    Date
                  </label>
                  <p className="font-medium">
                    {format(new Date(seller.reviewedAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                {seller.rejectionReason && (
                  <div>
                    <label className="text-sm text-[var(--text-secondary)]">
                      Reason
                    </label>
                    <p className="font-medium text-[var(--md-sys-color-error)]">
                      {seller.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {seller.applicationStatus === "PENDING" && (
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-[var(--border-default)]">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={onReject}
              style={{
                backgroundColor: "var(--md-sys-color-error)",
                color: "#ffffff",
              }}
            >
              Reject
            </Button>
            <Button onClick={onApprove}>Approve</Button>
          </div>
        )}
      </div>
    </div>
  );
}
