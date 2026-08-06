import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { submitHouseLotProperty } from "../api/property.client";
import type { HouseLotDraft } from "../contracts/property.contract";

export function useCreateProperty(options?: {
  onSuccess?: (propertyId: string) => void;
}) {
  return useSafeMutation({
    mutationFn: (values: HouseLotDraft) => submitHouseLotProperty(values),
    onSuccess: (property) => options?.onSuccess?.(property.id),
  });
}
