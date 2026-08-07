import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { approveApproval, rejectApproval } from "../api/approval.client";
import type { ApprovalItem } from "../contracts/approval.contract";

type ApprovalTarget = Pick<ApprovalItem, "id" | "entityType">;

export function useApprovalActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "approvals"] });

  const approve = useSafeMutation({
    mutationFn: (item: ApprovalTarget) => approveApproval(item),
    onSuccess: invalidate,
  });

  const reject = useSafeMutation({
    mutationFn: ({ item, reason }: { item: ApprovalTarget; reason: string }) =>
      rejectApproval(item, reason),
    onSuccess: invalidate,
  });

  return { approve, reject };
}
