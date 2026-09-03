import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  listMyStores,
  getStoreProfile,
  getStoreCategories,
  updateStoreProfile,
} from "../api/store-profile.client";
import { storeProfileKeys } from "../api/store-profile.keys";
import type {
  StoreProfile,
  StoreProfilesResponse,
  StoreCategoriesResponse,
  UpdateStoreProfileInput,
} from "../contracts/store-profile.contract";

/**
 * Hook to retrieve all stores owned by the seller.
 */
export function useStoreProfiles() {
  return useSafeQuery<StoreProfilesResponse, Error>({
    queryKey: storeProfileKeys.lists(),
    queryFn: listMyStores,
  });
}

/**
 * Hook to retrieve a single store profile by storeId.
 */
export function useStoreProfile(storeId?: string | null) {
  return useSafeQuery<StoreProfile, Error>({
    queryKey: storeId
      ? storeProfileKeys.detail(storeId)
      : storeProfileKeys.details(),
    queryFn: () => {
      if (!storeId) throw new Error("storeId is required");
      return getStoreProfile(storeId);
    },
    enabled: Boolean(storeId),
  });
}

/**
 * Hook to retrieve available store categories for profile selection.
 */
export function useStoreCategories() {
  return useSafeQuery<StoreCategoriesResponse, Error>({
    queryKey: storeProfileKeys.categories(),
    queryFn: getStoreCategories,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation hook to update store profile information.
 */
export function useUpdateStoreProfile(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      storeId,
      input,
    }: {
      storeId: string;
      input: UpdateStoreProfileInput;
    }) => updateStoreProfile(storeId, input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeProfileKeys.all });
      options?.onSuccess?.();
    },
  });
}
