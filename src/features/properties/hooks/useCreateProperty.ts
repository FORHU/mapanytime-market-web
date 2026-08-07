import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { submitHouseLotProperty } from "../api/property.client";
import type { HouseLotDraft } from "../contracts/property.contract";

export function useCreateProperty(options?: {
  onSuccess?: (propertyId: string) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (values: HouseLotDraft) => submitHouseLotProperty(values),
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
      options?.onSuccess?.(property.id);
    },
  });
}
