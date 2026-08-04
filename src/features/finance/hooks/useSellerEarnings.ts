import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createPayout,
  getSellerPayouts,
  getSellerSettlements,
  updatePayoutStatus,
} from "../api/finance.client";
import { financeKeys } from "../api/finance.keys";
import type { Payout, Settlement } from "../contracts/finance.contract";

export function useSellerSettlements(sellerId: string | null) {
  return useSafeQuery<Settlement[]>({
    queryKey: financeKeys.sellerSettlements(sellerId ?? ""),
    queryFn: () => getSellerSettlements(sellerId as string),
    enabled: Boolean(sellerId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSellerPayouts(sellerId: string | null) {
  return useSafeQuery<Payout[]>({
    queryKey: financeKeys.sellerPayouts(sellerId ?? ""),
    queryFn: () => getSellerPayouts(sellerId as string),
    enabled: Boolean(sellerId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Earnings summary for the seller dashboard: what is still held back, what is
 * withdrawable now, and which settlement ids a payout request should carry.
 */
export function useSellerEarnings(sellerId: string | null) {
  const settlements = useSellerSettlements(sellerId);
  const payouts = useSellerPayouts(sellerId);

  const summary = useMemo(() => {
    const rows = settlements.data ?? [];
    const sum = (list: Settlement[]) =>
      list.reduce((total, s) => total + s.sellerNetAmount, 0);

    const released = rows.filter((s) => s.status === "RELEASED");
    const pending = rows.filter(
      (s) => s.status === "PENDING" || s.status === "HELD",
    );

    return {
      availableAmount: sum(released),
      pendingAmount: sum(pending),
      lifetimeAmount: sum(rows.filter((s) => s.status !== "REFUNDED")),
      // Ids the backend will accept for a payout request.
      payableSettlementIds: released.map((s) => s.id),
    };
  }, [settlements.data]);

  return {
    settlements,
    payouts,
    summary,
    isLoading: settlements.isLoading || payouts.isLoading,
  };
}

export function useCreatePayout(sellerId: string | null) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      // A payout consumes settlements, so both lists are now stale.
      queryClient.invalidateQueries({
        queryKey: financeKeys.sellerPayouts(sellerId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: financeKeys.sellerSettlements(sellerId ?? ""),
      });
    },
  });
}

export function useUpdatePayoutStatus(sellerId: string | null) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: updatePayoutStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.sellerPayouts(sellerId ?? ""),
      });
    },
  });
}
