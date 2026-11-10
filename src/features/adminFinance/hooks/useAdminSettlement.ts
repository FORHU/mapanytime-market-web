import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getAdminSettlementSummary,
  getAdminSellerSummaries,
} from "../api/adminSettlement.client";
import {
  AdminSettlementSummary,
  AdminSellerSummariesPage,
} from "../contracts/adminSettlement.contract";

export function useAdminSettlementSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useSafeQuery<AdminSettlementSummary, Error>({
    queryKey: [
      "admin",
      "settlements",
      "summary",
      params?.startDate ?? "",
      params?.endDate ?? "",
    ],
    queryFn: ({ signal }) => getAdminSettlementSummary(params, signal),
  });
}

export function useAdminSellerSummaries(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useSafeQuery<AdminSellerSummariesPage, Error>({
    queryKey: [
      "admin",
      "settlements",
      "sellers",
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.search ?? "",
    ],
    queryFn: ({ signal }) => getAdminSellerSummaries(params, signal),
    placeholderData: keepPreviousData,
  });
}
