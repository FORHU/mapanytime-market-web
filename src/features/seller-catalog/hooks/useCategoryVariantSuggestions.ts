import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getToken } from "@/shared/lib/token";
import { getCategoryVariantSuggestions } from "../api/category-variant-suggestions.client";
import { sellerCatalogKeys } from "../api/seller-catalog.keys";
import type { CategoryVariantSuggestions } from "../contracts/category-variant-suggestions.contract";

/**
 * Suggested option names for the product option builder.
 *
 * Pass the sub-category once the seller has picked one, otherwise the store's
 * root category — the server merges ancestors either way, so the root still
 * yields something useful before a sub-category is chosen.
 *
 * Gated on `categoryId` because there is no meaningful all-categories request.
 */
export function useCategoryVariantSuggestions(categoryId: string | null) {
  return useSafeQuery<CategoryVariantSuggestions>({
    queryKey: sellerCatalogKeys.variantSuggestions(categoryId ?? ""),
    queryFn: () => getCategoryVariantSuggestions(categoryId as string),
    enabled: Boolean(categoryId) && Boolean(getToken()),
    // Seeded platform taxonomy — it only changes on a deploy, so the 5 minutes
    // used for seller-owned data would just re-fetch constants.
    staleTime: 60 * 60 * 1000,
  });
}
