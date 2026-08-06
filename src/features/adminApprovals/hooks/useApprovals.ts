import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listApprovals } from "../api/approval.client";
import type { ApprovalItem } from "../contracts/approval.contract";

export function useApprovals() {
  return useSafeQuery<ApprovalItem[], Error>({
    queryKey: ["admin", "approvals"],
    queryFn: listApprovals,
  });
}
