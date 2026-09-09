import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { deleteStore, listMyStores } from "../api/stores.client";
import { storesKeys } from "../api/stores.keys";
import type { StoresResponse } from "../contracts/manage-stores.contract";

export function useStores() {
  return useSafeQuery<StoresResponse, Error>({
    queryKey: storesKeys.myStores(),
    queryFn: listMyStores,
  });
}

/**
 * Delete a rejected store.
 *
 * Invalidates the store-profile keys alongside the list because both features
 * cache the same store: leaving the profile copy behind would let the seller
 * keep operating a store that is gone. No error handling here on purpose —
 * `MutationCache.onError` in the query provider already toasts failures, and a
 * second one here would double up.
 */
export function useDeleteStore(options?: {
  onSuccess?: (storeId: string) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({ storeId }: { storeId: string }) => deleteStore(storeId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: storesKeys.myStores() });
      // Raw key rather than `storeProfileKeys.all`: feature isolation forbids
      // importing another feature's module. `useResubmitStore` reaches the other
      // way across the same boundary with a raw ["stores"], for the same reason.
      queryClient.invalidateQueries({ queryKey: ["store-profile"] });
      options?.onSuccess?.(variables.storeId);
    },
  });
}
