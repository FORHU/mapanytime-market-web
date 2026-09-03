/**
 * Product tags — must match allowed values in the backend.
 * Enum names are sent to the API; display names are shown in the UI.
 */
export const PRODUCT_TAGS = {
  NEW_ARRIVAL: "NEW_ARRIVAL",
  POPULAR: "POPULAR",
  LIMITED_EDITION: "LIMITED_EDITION",
  BEST_SELLER: "BEST_SELLER",
  TRENDING: "TRENDING",
  ORGANIC: "ORGANIC",
  SEASONAL: "SEASONAL",
  VEGAN: "VEGAN",
  USED: "USED",
} as const;

/** Map enum names to human-readable display labels for the UI. */
const ENUM_TO_DISPLAY = {
  NEW_ARRIVAL: "New Arrival",
  POPULAR: "Popular",
  LIMITED_EDITION: "Limited Edition",
  BEST_SELLER: "Best Seller",
  TRENDING: "Trending",
  ORGANIC: "Organic",
  SEASONAL: "Seasonal",
  VEGAN: "Vegan",
  USED: "Used",
} as const;

export type ProductTagType = (typeof PRODUCT_TAGS)[keyof typeof PRODUCT_TAGS];

/** All tags in order. */
export const ALL_PRODUCT_TAGS: ProductTagType[] = Object.values(PRODUCT_TAGS);

/**
 * The same list as a non-empty tuple, which is what `z.enum` needs. Derived
 * from PRODUCT_TAGS so it cannot drift from ALL_PRODUCT_TAGS.
 */
export const ALL_PRODUCT_TAGS_TUPLE = Object.values(PRODUCT_TAGS) as [
  ProductTagType,
  ...ProductTagType[],
];

/** Display labels for each tag (enum name → human-readable text). */
export const TAG_LABELS: Record<ProductTagType, string> = ENUM_TO_DISPLAY;
