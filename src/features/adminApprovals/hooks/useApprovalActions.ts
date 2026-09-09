import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  approveApproval,
  claimApproval,
  rejectApproval,
  releaseApproval,
  requestRevision,
} from "../api/approval.client";
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

  // `force` is set only after the admin has been shown who holds the claim and
  // chosen to take it anyway — never as an automatic retry.
  const claim = useSafeMutation({
    mutationFn: ({ item, force }: { item: ApprovalTarget; force?: boolean }) =>
      claimApproval(item, force ?? false),
    onSuccess: invalidate,
  });

  const release = useSafeMutation({
    mutationFn: (item: ApprovalTarget) => releaseApproval(item),
    onSuccess: invalidate,
  });

  const revise = useSafeMutation({
    mutationFn: ({ item, notes }: { item: ApprovalTarget; notes: string }) =>
      requestRevision(item, notes),
    onSuccess: invalidate,
  });

  return { approve, reject, claim, release, revise };
}
