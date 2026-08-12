import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getStoreById } from "../api/stores.client";
import { storesKeys } from "../api/stores.keys";

/**
 * Resolves the store's main (root) category from the public store detail
 * endpoint, which exposes both the M2M `categories` list and the optional
 * `primaryCategory` relation.
 */
export function useStoreCategories(storeId: string | null) {
  const query = useSafeQuery({
    queryKey: storesKeys.storeDetail(storeId ?? ""),
    queryFn: () => getStoreById(storeId as string),
    enabled: Boolean(storeId),
  });

  const store = query.data;
  const mainCategory =
    store?.primaryCategory ??
    store?.categories.find((c) => !c.parentId) ??
    store?.categories[0] ??
    null;

  return {
    mainCategory,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
