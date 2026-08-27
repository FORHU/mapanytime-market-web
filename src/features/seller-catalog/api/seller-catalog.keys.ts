export const sellerCatalogKeys = {
  all: ["seller-catalog"] as const,
  supplierProducts: () =>
    [...sellerCatalogKeys.all, "supplier-products"] as const,
  bySeller: (sellerId: string) =>
    [...sellerCatalogKeys.supplierProducts(), "seller", sellerId] as const,
  byProduct: (productId: string) =>
    [...sellerCatalogKeys.supplierProducts(), "product", productId] as const,
  // `storeId` is part of the key (null = All Stores) so switching store context
  // refetches the tree rather than reusing the previous store's categories.
  myCategoryTree: (storeId: string | null) =>
    [...sellerCatalogKeys.all, "my-category-tree", storeId ?? "all"] as const,
  variantSuggestions: (categoryId: string) =>
    [...sellerCatalogKeys.all, "variant-suggestions", categoryId] as const,
} as const;
