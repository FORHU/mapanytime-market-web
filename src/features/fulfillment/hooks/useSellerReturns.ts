import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { getSellerReturns, updateReturnStatus } from "../api/returns.client";
import { fulfillmentKeys } from "../api/fulfillment.keys";
import type { ReturnRequest } from "../contracts/fulfillment.contract";

/** Return requests awaiting this seller's decision. */
export function useSellerReturns(sellerId: string | null) {
  return useSafeQuery<ReturnRequest[]>({
    queryKey: fulfillmentKeys.sellerReturns(sellerId ?? ""),
    queryFn: () => getSellerReturns(sellerId as string),
    enabled: Boolean(sellerId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateReturnStatus(sellerId: string | null) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: updateReturnStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fulfillmentKeys.sellerReturns(sellerId ?? ""),
      });
    },
  });
}
