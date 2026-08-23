"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { RotateCcw } from "lucide-react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  useSellerReturns,
  useUpdateReturnStatus,
} from "@/features/fulfillment/hooks/useSellerReturns";
import { formatPeso } from "@/shared/lib/currency";
import type {
  ReturnRequest,
  ReturnStatus,
} from "@/features/fulfillment/contracts/fulfillment.contract";

const RETURN_BADGES: Record<ReturnStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ITEM_RECEIVED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  REFUNDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${RETURN_BADGES[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReturnRow({
  request,
  onUpdate,
  isUpdating,
}: {
  request: ReturnRequest;
  onUpdate: (status: ReturnStatus) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="py-4 border-b border-[var(--border-light)] last:border-0 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            Order #{request.orderId.slice(0, 8)}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Requested {formatDate(request.requestedAt)}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
            {formatPeso(request.refundAmount)}
          </p>
          <StatusBadge status={request.status} />
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{request.reason}</p>
      {request.status === "PENDING" && (
        <div className="flex gap-2 pt-1">
          <button
            disabled={isUpdating}
            onClick={() => onUpdate("APPROVED")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={isUpdating}
            onClick={() => onUpdate("REJECTED")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function SellerFulfillmentPage() {
  const { userId, isHydrated } = useCurrentUser();
  const { data, isLoading, isError } = useSellerReturns(
    isHydrated ? userId : null,
  );
  const updateStatus = useUpdateReturnStatus(userId);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleUpdate = (returnId: string, status: ReturnStatus) => {
    setPendingId(returnId);
    updateStatus.mutate(
      { returnId, status },
      { onSettled: () => setPendingId(null) },
    );
  };

  const returns = data ?? [];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Returns
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Review and decide on return requests raised against your orders.
        </p>
      </div>

      {isHydrated && !userId && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Sign in required
            </p>
          </CardContent>
        </Card>
      )}

      {userId && (isLoading || !isHydrated) && (
        <Card>
          <CardContent className="p-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[var(--background-tertiary)] animate-pulse"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {userId && isError && (
        <Card>
          <CardContent className="p-8 text-center py-16">
            <p className="text-sm text-rose-500">
              Could not load return requests. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {userId && !isLoading && !isError && (
        <Card>
          <CardContent className="p-6">
            {returns.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <RotateCcw className="w-8 h-8 mx-auto text-[var(--text-tertiary)] opacity-40" />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  No return requests
                </p>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                  Return requests from buyers will show up here.
                </p>
              </div>
            ) : (
              returns.map((request) => (
                <ReturnRow
                  key={request.id}
                  request={request}
                  isUpdating={
                    updateStatus.isPending && pendingId === request.id
                  }
                  onUpdate={(status) => handleUpdate(request.id, status)}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
