import { fetcher } from "@/shared/lib/http";
import {
  CategoryVariantSuggestionsSchema,
  type CategoryVariantSuggestions,
} from "../contracts/category-variant-suggestions.contract";

/**
 * Suggested option names for a category, already merged with everything
 * inherited from its ancestors by the server — so passing a sub-category id
 * returns both its own list and its root's, in one request.
 *
 * Returns 200 with an empty list (not 404) when a category has no suggestions,
 * which is the common case.
 */
export const getCategoryVariantSuggestions = async (
  categoryId: string,
): Promise<CategoryVariantSuggestions> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/categories/${encodeURIComponent(categoryId)}/variant-suggestions`,
  );

  return CategoryVariantSuggestionsSchema.parse(res.data);
};
