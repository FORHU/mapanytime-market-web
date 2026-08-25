import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listPromotions, type PromotionsList } from "../api/promotions.client";
import { promotionsKeys } from "../api/promotions.keys";

export function usePromotions(storeId: string | null) {
  return useSafeQuery<PromotionsList, Error>({
    queryKey: promotionsKeys.list(storeId ?? ""),
    queryFn: () => listPromotions(storeId as string),
    enabled: Boolean(storeId),
  });
}
