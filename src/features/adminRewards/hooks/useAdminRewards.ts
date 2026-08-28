import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  getAdminRewardConfig,
  updateRewardConfig,
  listAdminVouchers,
  createVoucher,
  updateVoucher,
} from "../api/adminRewards.client";
import { adminRewardsKeys } from "../api/adminRewards.keys";
import type {
  AdminRewardConfig,
  AdminVoucher,
  UpdateRewardConfigInput,
  CreateVoucherInput,
  UpdateVoucherInput,
} from "../contracts/adminRewards.contract";

/** Rarely changes — matches the buyer-facing config query's stale time. */
export function useAdminRewardConfig() {
  return useSafeQuery<AdminRewardConfig | null, Error>({
    queryKey: adminRewardsKeys.config(),
    queryFn: getAdminRewardConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateRewardConfig() {
  const queryClient = useQueryClient();
  return useSafeMutation<AdminRewardConfig, Error, UpdateRewardConfigInput>({
    mutationFn: updateRewardConfig,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminRewardsKeys.config() }),
  });
}

export function useAdminVouchers() {
  return useSafeQuery<AdminVoucher[], Error>({
    queryKey: adminRewardsKeys.vouchers(),
    queryFn: listAdminVouchers,
  });
}

export function useAdminVoucherActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminRewardsKeys.vouchers() });

  const create = useSafeMutation<AdminVoucher, Error, CreateVoucherInput>({
    mutationFn: (input) => createVoucher(input),
    onSuccess: invalidate,
  });

  const update = useSafeMutation<
    AdminVoucher,
    Error,
    { id: string; input: UpdateVoucherInput }
  >({
    mutationFn: ({ id, input }) => updateVoucher(id, input),
    onSuccess: invalidate,
  });

  /** Vouchers aren't deletable server-side — deactivate instead so a voucher
   * points have already been spent on stays honorable. */
  const toggleActive = useSafeMutation<
    AdminVoucher,
    Error,
    { id: string; isActive: boolean }
  >({
    mutationFn: ({ id, isActive }) => updateVoucher(id, { isActive }),
    onSuccess: invalidate,
  });

  return { create, update, toggleActive };
}
