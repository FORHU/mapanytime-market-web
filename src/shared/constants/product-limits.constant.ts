/**
 * Bounds for seller-authored product fields.
 *
 * These mirror mapanytime-api/src/constants/product-limits.constant.ts, which
 * is the enforcing copy — everything here is UX only, so a form can show the
 * ceiling before the request goes out. The create and edit forms previously
 * carried their own disagreeing numbers, which made a product created through
 * one impossible to save through the other.
 */
export const PRODUCT_LIMITS = {
  NAME_MAX: 200,
  BRAND_MAX: 60,
  DESCRIPTION_MAX: 600,
  PRICE_MAX: 999_999_999.99,
  STOCK_MAX: 999_999_999,
} as const;

/** Ceilings spelled out for the user, formatted the way the fields are. */
export const PRICE_MAX_LABEL = new Intl.NumberFormat("en-US").format(
  PRODUCT_LIMITS.PRICE_MAX,
);
export const STOCK_MAX_LABEL = new Intl.NumberFormat("en-US").format(
  PRODUCT_LIMITS.STOCK_MAX,
);
