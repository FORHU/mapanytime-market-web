import { fetcher } from "@/shared/lib/http";
import {
  ReviewListSchema,
  type ReviewList,
} from "../contracts/review.contract";

/**
 * Store and product reviews.
 *
 * Replaces `features/orders/api/reviews.api.ts`, which was dead code calling
 * endpoints that did not exist, bypassing `fetcher`, and reading the auth token
 * straight out of `localStorage` — which this app no longer uses.
 */
export async function getStoreReviews(storeId: string): Promise<ReviewList> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/reviews/stores/${storeId}`,
  );
  return ReviewListSchema.parse(res.data);
}

export async function getProductReviews(
  productId: string,
): Promise<ReviewList> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/reviews/products/${productId}`,
  );
  return ReviewListSchema.parse(res.data);
}

/** Leave or update a review. Requires a completed order for the subject. */
export async function upsertStoreReview(
  storeId: string,
  input: { rating: number; comment?: string },
): Promise<void> {
  await fetcher<unknown>(`/api/v1/reviews/stores/${storeId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function upsertProductReview(
  productId: string,
  input: { rating: number; comment?: string },
): Promise<void> {
  await fetcher<unknown>(`/api/v1/reviews/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
