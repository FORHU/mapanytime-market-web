import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveSeller,
  rejectSeller,
  getSellerDetail,
} from "../api/seller.client";
import { toast } from "sonner";
import { SELLERS_QUERY_KEY, sellerDetailKey } from "./queryKeys";

export function useGetSellerDetail(sellerId: string) {
  return useQuery({
    queryKey: sellerDetailKey(sellerId),
    queryFn: ({ signal }) => getSellerDetail(sellerId, signal),
    enabled: !!sellerId,
  });
}

/**
 * Both the list and the reviewed seller's own detail entry go stale after a
 * decision — invalidating only the list left the modal showing PENDING with
 * live action buttons, so a second click 409'd.
 */
function useSellerDecision<TArgs>(
  mutationFn: (args: TArgs) => Promise<{ data: { name: string } }>,
  successMessage: (name: string) => string,
  failureMessage: string,
  sellerIdOf: (args: TArgs) => string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, args) => {
      toast.success(successMessage(data.data.name));
      queryClient.invalidateQueries({ queryKey: SELLERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: sellerDetailKey(sellerIdOf(args)),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || failureMessage);
    },
  });
}

export function useApproveSeller() {
  return useSellerDecision(
    (sellerId: string) => approveSeller(sellerId),
    (name) => `${name} approved successfully`,
    "Failed to approve seller",
    (sellerId) => sellerId,
  );
}

export function useRejectSeller() {
  return useSellerDecision(
    ({ sellerId, reason }: { sellerId: string; reason: string }) =>
      rejectSeller(sellerId, reason),
    (name) => `${name} rejected`,
    "Failed to reject seller",
    ({ sellerId }) => sellerId,
  );
}
