import { z } from "zod";

/**
 * Suggested product-option names for a category, as served by
 * GET /api/v1/categories/:id/variant-suggestions.
 *
 * `source` and `fromCategoryName` are `.optional()` so a server that predates
 * them still parses — the name alone is enough to render the dropdown.
 */
export const VariantSuggestionSchema = z.object({
  name: z.string(),
  /** Whether this came from the requested category itself or from an ancestor. */
  source: z.enum(["category", "inherited"]).optional(),
  /** The ancestor it was inherited from; null when `source` is "category". */
  fromCategoryName: z.string().nullable().optional(),
});

export const CategoryVariantSuggestionsSchema = z.object({
  categoryId: z.string(),
  suggestions: z.array(VariantSuggestionSchema),
});

export type VariantSuggestion = z.infer<typeof VariantSuggestionSchema>;
export type CategoryVariantSuggestions = z.infer<
  typeof CategoryVariantSuggestionsSchema
>;
