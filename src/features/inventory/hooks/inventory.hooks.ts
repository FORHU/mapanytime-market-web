import { useMemo } from "react";
import { deriveInventoryItems } from "../api/inventory.client";
import type { InventoryItemsResponse } from "../contracts/inventory.contract";

export function useInventoryItems(
  products: unknown[] | undefined,
): InventoryItemsResponse {
  return useMemo(() => deriveInventoryItems(products ?? []), [products]);
}
