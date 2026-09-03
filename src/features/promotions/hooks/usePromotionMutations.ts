import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
} from "../api/promotions.client";
import { promotionsKeys } from "../api/promotions.keys";
import type {
  CreatePromotionPayload,
  PromotionFields,
} from "../contracts/promotions.contract";

export function useCreatePromotion(storeId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (payload: CreatePromotionPayload) => createPromotion(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: promotionsKeys.list(storeId) }),
  });
}

export function useUpdatePromotion(storeId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PromotionFields }) =>
      updatePromotion(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: promotionsKeys.list(storeId) }),
  });
}

export function useDeletePromotion(storeId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: promotionsKeys.list(storeId) }),
  });
}

export function useTogglePromotion(storeId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePromotion(id, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: promotionsKeys.list(storeId) }),
  });
}
