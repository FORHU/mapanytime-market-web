import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listPendingSellers } from "../api/seller.client";
import { SELLERS_QUERY_KEY } from "./queryKeys";

export function usePendingSellers(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...SELLERS_QUERY_KEY, page, limit],
    queryFn: ({ signal }) => listPendingSellers(page, limit, signal),
    staleTime: 30 * 1000,
    // Keeps the current page rendered while the next one loads, so paging
    // doesn't flash the empty state.
    placeholderData: keepPreviousData,
  });
}
