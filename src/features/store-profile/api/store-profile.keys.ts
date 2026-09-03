/**
 * TanStack Query Key Factory for the store-profile feature.
 */
export const storeProfileKeys = {
  all: ["store-profile"] as const,
  lists: () => [...storeProfileKeys.all, "list"] as const,
  details: () => [...storeProfileKeys.all, "detail"] as const,
  detail: (id: string) => [...storeProfileKeys.details(), id] as const,
  categories: () => [...storeProfileKeys.all, "categories"] as const,
};
