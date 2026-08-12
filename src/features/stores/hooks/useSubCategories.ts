import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getSubCategories } from "../api/categories.client";
import { storesKeys } from "../api/stores.keys";

export function useSubCategories(parentId: string | null | undefined) {
  return useSafeQuery({
    queryKey: storesKeys.subCategories(parentId ?? ""),
    queryFn: () => getSubCategories(parentId as string),
    enabled: Boolean(parentId),
  });
}
