import { fetcher } from "@/shared/lib/http";
import {
  PendingSellersPageSchema,
  SellerDetailSchema,
} from "../contracts/seller.contract";

export async function listPendingSellers(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
) {
  // `page`/`limit` are what parsePagination reads server-side. An `offset`
  // param is silently ignored, which pinned every request to the first page.
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetcher<{ data: unknown }>(
    `/api/v1/admin/sellers?${query.toString()}`,
    { signal },
  );
  return PendingSellersPageSchema.parse(response.data);
}

export async function getSellerDetail(sellerId: string, signal?: AbortSignal) {
  const response = await fetcher<{ data: unknown }>(
    `/api/v1/admin/sellers/${sellerId}`,
    { signal },
  );
  return SellerDetailSchema.parse(response.data);
}

interface SellerActionResponse {
  data: {
    name: string;
  };
}

export async function approveSeller(
  sellerId: string,
  signal?: AbortSignal,
): Promise<SellerActionResponse> {
  return fetcher<SellerActionResponse>(
    `/api/v1/admin/sellers/${sellerId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({}),
      signal,
    },
  );
}

export async function rejectSeller(
  sellerId: string,
  reason: string,
  signal?: AbortSignal,
): Promise<SellerActionResponse> {
  return fetcher<SellerActionResponse>(
    `/api/v1/admin/sellers/${sellerId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
      signal,
    },
  );
}
