import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listPromotions } from "../api/promotions.client";
import { promotionsKeys } from "../api/promotions.keys";
import type { PromotionsResponse } from "../contracts/promotions.contract";

export function usePromotions(storeId: string | null) {
  return useSafeQuery<PromotionsResponse, Error>({
    queryKey: promotionsKeys.list(storeId ?? ""),
    queryFn: () => listPromotions(storeId as string),
    enabled: Boolean(storeId),
  });
}
