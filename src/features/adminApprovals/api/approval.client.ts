import { fetcher } from "@/shared/lib/http";
import {
  ApprovalsResponseSchema,
  type ApprovalItem,
} from "../contracts/approval.contract";

export async function listApprovals(): Promise<ApprovalItem[]> {
  const response = await fetcher<{ data: unknown }>("/api/v1/admin/approvals");
  return ApprovalsResponseSchema.parse(response.data);
}

export async function approveApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(
    `/api/v1/admin/approvals/${item.entityType === "PROPERTY" ? "properties" : "stores"}/${item.id}/approve`,
    { method: "POST", signal },
  );
}

export async function rejectApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  reason: string,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(
    `/api/v1/admin/approvals/${item.entityType === "PROPERTY" ? "properties" : "stores"}/${item.id}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
      signal,
    },
  );
}
