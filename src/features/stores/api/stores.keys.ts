export const storesKeys = {
  all: ["stores"] as const,
  categories: () => [...storesKeys.all, "categories", "root"] as const,
  subCategories: (parentId: string) =>
    [...storesKeys.all, "categories", "sub", parentId] as const,
  myStores: () => [...storesKeys.all, "my-stores"] as const,
  storeDetail: (storeId: string) =>
    [...storesKeys.all, "detail", storeId] as const,
} as const;
