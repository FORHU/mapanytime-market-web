import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  getWallet,
  getConfig,
  getVoucherCatalog,
  claimVoucher,
  getMyVouchers,
  getTransactions,
} from "../api/rewards.client";
import { rewardsKeys } from "../api/rewards.keys";
import type {
  RewardWallet,
  RewardConfig,
  RewardVoucher,
  UserVoucher,
  RewardTransactionPage,
} from "../contracts/rewards.contract";

export function useWallet() {
  return useSafeQuery<RewardWallet, Error>({
    queryKey: rewardsKeys.wallet(),
    queryFn: getWallet,
  });
}

/** Rarely changes — no invalidation wiring needed elsewhere. */
export function useRewardsConfig() {
  return useSafeQuery<RewardConfig, Error>({
    queryKey: rewardsKeys.config(),
    queryFn: getConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVoucherCatalog() {
  return useSafeQuery<RewardVoucher[], Error>({
    queryKey: rewardsKeys.vouchers(),
    queryFn: getVoucherCatalog,
  });
}

export function useMyVouchers(status?: "ACTIVE" | "USED" | "EXPIRED") {
  return useSafeQuery<UserVoucher[], Error>({
    queryKey: rewardsKeys.myVouchers(status),
    queryFn: () => getMyVouchers(status),
  });
}

export function useTransactions(page = 1, type?: string) {
  return useSafeQuery<RewardTransactionPage, Error>({
    queryKey: rewardsKeys.transactions(page, type),
    queryFn: () => getTransactions(page, 20, type),
  });
}

/** Claiming changes three things: the wallet balance, the catalog's stock,
 * and the buyer's claimed-voucher list — invalidate all three. */
export function useClaimVoucher() {
  const queryClient = useQueryClient();

  return useSafeMutation<UserVoucher, Error, string>({
    mutationFn: claimVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardsKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: rewardsKeys.vouchers() });
      queryClient.invalidateQueries({
        queryKey: [...rewardsKeys.all, "my-vouchers"],
      });
    },
  });
}
