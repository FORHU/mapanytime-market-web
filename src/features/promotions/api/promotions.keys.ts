export const promotionsKeys = {
  all: ["promotions"] as const,
  list: (storeId: string) => [...promotionsKeys.all, "list", storeId] as const,
} as const;
