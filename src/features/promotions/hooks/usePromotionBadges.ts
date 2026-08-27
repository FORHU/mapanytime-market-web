import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listPromotionBadges } from "../api/promotions.client";
import { promotionsKeys } from "../api/promotions.keys";
import type { PromotionBadge } from "../contracts/promotions.contract";

export function usePromotionBadges() {
  return useSafeQuery<PromotionBadge[], Error>({
    queryKey: promotionsKeys.badges(),
    queryFn: listPromotionBadges,
    // Reference data — the list barely changes, so avoid refetching on every
    // promotion form open.
    staleTime: 60 * 60 * 1000,
  });
}
