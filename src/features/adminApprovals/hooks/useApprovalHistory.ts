import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listApprovalHistory } from "../api/approval.client";
import type { ApprovalHistoryEntry } from "../contracts/approval.contract";

/**
 * The review timeline for one store, read from the audit log.
 *
 * Only fetched once a reviewer opens the panel — the queue can be long, and the
 * history is the one thing on the card nobody needs until they ask for it.
 */
export function useApprovalHistory(storeId: string | null) {
  return useSafeQuery<ApprovalHistoryEntry[], Error>({
    queryKey: ["admin", "approvals", "history", storeId],
    queryFn: () => {
      if (!storeId) throw new Error("storeId is required");
      return listApprovalHistory(storeId);
    },
    enabled: Boolean(storeId),
  });
}
