import { fetcher } from "@/shared/lib/http";
import {
  AdminSettlementSummary,
  AdminSettlementSummarySchema,
  AdminSellerSummariesPage,
  AdminSellerSummariesPageSchema,
} from "../contracts/adminSettlement.contract";

export async function getAdminSettlementSummary(
  params?: {
    startDate?: string;
    endDate?: string;
  },
  signal?: AbortSignal,
): Promise<AdminSettlementSummary> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  const qs = query.toString();
  const url = `/api/v1/settlements/admin/summary${qs ? `?${qs}` : ""}`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AdminSettlementSummarySchema.parse(response.data);
}

export async function getAdminSellerSummaries(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  },
  signal?: AbortSignal,
): Promise<AdminSellerSummariesPage> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search.trim());

  const qs = query.toString();
  const url = `/api/v1/settlements/admin/sellers${qs ? `?${qs}` : ""}`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AdminSellerSummariesPageSchema.parse(response.data);
}
