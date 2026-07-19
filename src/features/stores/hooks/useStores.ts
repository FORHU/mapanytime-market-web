import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listMyStores } from "../api/stores.client";
import { storesKeys } from "../api/stores.keys";
import type { StoresResponse } from "../contracts/manage-stores.contract";

export function useStores() {
  return useSafeQuery<StoresResponse, Error>({
    queryKey: storesKeys.myStores(),
    queryFn: listMyStores,
  });
}
