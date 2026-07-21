import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { submitOnboarding } from "../api/onboarding.client";
import { storesKeys } from "../api/stores.keys";

export function useCreateStore(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
  onSuccess?: (storeId: string) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: submitOnboarding,
    onValidationError: options?.onValidationError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: storesKeys.myStores() });
      options?.onSuccess?.(data.storeId);
    },
  });
}
