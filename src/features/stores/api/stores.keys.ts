export const storesKeys = {
  all: ["stores"] as const,
  categories: () => [...storesKeys.all, "categories", "root"] as const,
  myStores: () => [...storesKeys.all, "my-stores"] as const,
} as const;
