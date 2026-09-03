import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getStoreReviews, getProductReviews } from "../api/reviews.client";
import type { ReviewList } from "../contracts/review.contract";

export function useStoreReviews(storeId?: string | null) {
  return useSafeQuery<ReviewList, Error>({
    queryKey: ["reviews", "store", storeId],
    queryFn: () => getStoreReviews(storeId as string),
    enabled: Boolean(storeId),
  });
}

export function useProductReviews(productId?: string | null) {
  return useSafeQuery<ReviewList, Error>({
    queryKey: ["reviews", "product", productId],
    queryFn: () => getProductReviews(productId as string),
    enabled: Boolean(productId),
  });
}
