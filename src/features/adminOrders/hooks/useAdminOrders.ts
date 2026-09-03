import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  listAdminOrders,
  type AdminOrdersQuery,
} from "../api/adminOrders.client";
import type { AdminOrdersPage } from "../contracts/adminOrder.contract";

export function useAdminOrders(query: AdminOrdersQuery) {
  return useSafeQuery<AdminOrdersPage, Error>({
    queryKey: [
      "admin",
      "orders",
      query.status ?? "ALL",
      query.search ?? "",
      query.page ?? 1,
    ],
    queryFn: () => listAdminOrders(query),
    // Keep the current page on screen while the next one loads, so paging and
    // filtering do not flash an empty table.
    placeholderData: keepPreviousData,
  });
}
