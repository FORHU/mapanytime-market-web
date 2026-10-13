import { fetcher } from "@/shared/lib/http";
import {
  ApprovalsResponseSchema,
  ApprovalHistoryResponseSchema,
  type ApprovalItem,
  type ApprovalHistoryEntry,
} from "../contracts/approval.contract";

/** Store endpoints live under /stores, properties under /properties. */
const segment = (entityType: ApprovalItem["entityType"]) =>
  entityType === "PROPERTY" ? "properties" : "stores";

const base = (item: Pick<ApprovalItem, "id" | "entityType">) =>
  `/api/v1/admin/approvals/${segment(item.entityType)}/${item.id}`;

export async function listApprovals(): Promise<ApprovalItem[]> {
  const response = await fetcher<{ data: unknown }>("/api/v1/admin/approvals");
  return ApprovalsResponseSchema.parse(response.data);
}

export async function approveApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(`${base(item)}/approve`, { method: "POST", signal });
}

export async function rejectApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  reason: string,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(`${base(item)}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    signal,
  });
}

/**
 * Take a store for review.
 *
 * Without `force` the API refuses with `ALREADY_CLAIMED` when another admin
 * holds it, and returns their name in `details` so the UI can offer a
 * considered takeover rather than silently stealing the claim.
 */
export async function claimApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  force = false,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(`${base(item)}/claim`, {
    method: "POST",
    body: JSON.stringify({ force }),
    signal,
  });
}

export async function releaseApproval(
  item: Pick<ApprovalItem, "id" | "entityType">,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(`${base(item)}/claim`, { method: "DELETE", signal });
}

/** Send a store back to the seller with a list of what to change. */
export async function requestRevision(
  item: Pick<ApprovalItem, "id" | "entityType">,
  notes: string,
  signal?: AbortSignal,
) {
  await fetcher<unknown>(`${base(item)}/request-revision`, {
    method: "POST",
    body: JSON.stringify({ notes }),
    signal,
  });
}

export async function listApprovalHistory(
  storeId: string,
): Promise<ApprovalHistoryEntry[]> {
  const response = await fetcher<{ data: unknown }>(
    `/api/v1/admin/approvals/stores/${storeId}/history`,
  );
  return ApprovalHistoryResponseSchema.parse(response.data);
}
