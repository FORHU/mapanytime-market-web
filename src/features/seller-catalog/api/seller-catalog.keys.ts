export const sellerCatalogKeys = {
  all: ["seller-catalog"] as const,
  supplierProducts: () =>
    [...sellerCatalogKeys.all, "supplier-products"] as const,
  bySeller: (sellerId: string) =>
    [...sellerCatalogKeys.supplierProducts(), "seller", sellerId] as const,
  byProduct: (productId: string) =>
    [...sellerCatalogKeys.supplierProducts(), "product", productId] as const,
} as const;
