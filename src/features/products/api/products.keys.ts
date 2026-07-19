export const productsKeys = {
  all: ["products"] as const,
  lists: (storeId: string) => [...productsKeys.all, "list", storeId] as const,
  detail: (productId: string) =>
    [...productsKeys.all, "detail", productId] as const,
} as const;

export const categoriesKeys = {
  all: ["categories"] as const,
} as const;
