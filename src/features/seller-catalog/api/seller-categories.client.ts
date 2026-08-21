import { fetcher } from "@/shared/lib/http";
import {
  SellerCategoryTreeResponseSchema,
  type SellerCategoryNode,
} from "@/shared/contracts/products.contract";

/**
 * The category hierarchy the seller actually has products in.
 *
 * `storeId` is omitted in All-Stores mode, which makes the API aggregate across
 * every store the seller owns — the same conditional `useProductsPipeline` uses
 * for the product list itself, so the filter and the list always agree on scope.
 */
export const getMyCategoryTree = async (
  storeId: string | null,
): Promise<SellerCategoryNode[]> => {
  const query = new URLSearchParams();
  if (storeId) query.append("storeId", storeId);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await fetcher<unknown>(`/api/v1/products/my-categories${suffix}`);

  return SellerCategoryTreeResponseSchema.parse(res).data;
};
