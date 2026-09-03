/** Shared so the list and detail caches can't drift out of sync on invalidation. */
export const SELLERS_QUERY_KEY = ["sellers", "pending"];

export const sellerDetailKey = (sellerId: string) => ["seller", sellerId];
