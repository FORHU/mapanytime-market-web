export const promotionsKeys = {
  all: ["promotions"] as const,
  list: (storeId: string) => [...promotionsKeys.all, "list", storeId] as const,
  badges: () => [...promotionsKeys.all, "badges"] as const,
} as const;
