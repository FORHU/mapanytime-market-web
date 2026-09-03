"use client";

import { useEffect, useState } from "react";
import {
  usePendingSellers,
  useApproveSeller,
  useRejectSeller,
} from "@/features/adminSellers/hooks";
import SellerTable from "./_components/SellerTable";
import SellerDetailModal from "./_components/SellerDetailModal";
import RejectionModal from "./_components/RejectionModal";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

const PAGE_SIZE = 20;

export default function SellersAdminPage() {
  const [page, setPage] = useState(1);
  const [detailSellerId, setDetailSellerId] = useState<string | null>(null);
  const [rejectSellerId, setRejectSellerId] = useState<string | null>(null);
  const [approveSellerId, setApproveSellerId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePendingSellers(
    page,
    PAGE_SIZE,
  );
  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();

  // Reviewing the last applicant on a page empties it. Step back rather than
  // stranding the admin on a blank page they can't tell apart from "all done".
  useEffect(() => {
    if (data && data.items.length === 0 && page > 1) {
      setPage((current) => Math.max(1, Math.min(current - 1, data.totalPages)));
    }
  }, [data, page]);

  const confirmApprove = () => {
    if (!approveSellerId) return;
    approveMutation.mutate(approveSellerId, {
      onSettled: () => setApproveSellerId(null),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Seller Approvals
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Review and approve pending seller accounts
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-core)]"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">
            Loading sellers...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)] p-6 text-center">
          <p className="text-[var(--md-sys-color-on-error-container)] font-medium">
            Could not load pending sellers.
          </p>
          <p className="mt-1 text-sm text-[var(--md-sys-color-on-error-container)]">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="bg-[var(--brand-light)] border border-[var(--brand-core)] rounded-lg p-4">
            <p className="text-sm text-[var(--brand-burgundy)]">
              Showing {data.items.length} of {data.total} pending sellers
            </p>
          </div>

          <SellerTable
            sellers={data.items}
            onView={setDetailSellerId}
            onApprove={setApproveSellerId}
            onReject={setRejectSellerId}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-secondary)]">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={data.page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : null}

      {detailSellerId && (
        <SellerDetailModal
          sellerId={detailSellerId}
          onClose={() => setDetailSellerId(null)}
          onApprove={() => {
            setApproveSellerId(detailSellerId);
            setDetailSellerId(null);
          }}
          onReject={() => {
            setRejectSellerId(detailSellerId);
            setDetailSellerId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(approveSellerId)}
        title="Approve this seller?"
        description="They'll be able to create and manage products immediately."
        confirmLabel="Approve"
        isLoading={approveMutation.isPending}
        onConfirm={confirmApprove}
        onCancel={() => setApproveSellerId(null)}
      />

      {rejectSellerId && (
        <RejectionModal
          onSubmit={async (reason) => {
            await rejectMutation.mutateAsync({
              sellerId: rejectSellerId,
              reason,
            });
          }}
          onClose={() => setRejectSellerId(null)}
          isLoading={rejectMutation.isPending}
        />
      )}
    </div>
  );
}
