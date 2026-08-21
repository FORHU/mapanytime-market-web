import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getToken } from "@/shared/lib/token";
import { getMyCategoryTree } from "../api/seller-categories.client";
import { sellerCatalogKeys } from "../api/seller-catalog.keys";
import type { SellerCategoryNode } from "@/shared/contracts/products.contract";

/**
 * Categories the seller has products in, for the "My products" filter.
 *
 * Deliberately NOT gated on `storeId`: a null id means All-Stores mode, which is
 * a valid scope the API understands. Gating on it is what left the filter empty
 * in Global View. Auth is the only precondition, matching useProductsPipeline.
 */
export function useSellerCategoryTree(storeId: string | null) {
  return useSafeQuery<SellerCategoryNode[]>({
    queryKey: sellerCatalogKeys.myCategoryTree(storeId),
    queryFn: () => getMyCategoryTree(storeId),
    enabled: Boolean(getToken()),
    staleTime: 5 * 60 * 1000,
  });
}
