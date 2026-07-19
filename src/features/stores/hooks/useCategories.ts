import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getRootCategories } from "../api/categories.client";
import { storesKeys } from "../api/stores.keys";

export function useCategories() {
  return useSafeQuery({
    queryKey: storesKeys.categories(),
    queryFn: getRootCategories,
  });
}
