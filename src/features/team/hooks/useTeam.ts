import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { teamKeys } from "../api/team.keys";
import {
  getOrgContext,
  getOrgStores,
  listMembers,
  updateMember,
  deleteMember,
  createStaffAccount,
} from "../api/team.client";
import type {
  OrgContext,
  OrgStore,
  OrgMember,
  CreatedStaff,
} from "../contracts/team.contract";

export function useOrgContext(enabled = true) {
  return useSafeQuery<OrgContext, Error>({
    queryKey: teamKeys.context(),
    queryFn: getOrgContext,
    enabled,
  });
}

export function useOrgStores(enabled = true) {
  return useSafeQuery<OrgStore[], Error>({
    queryKey: teamKeys.stores(),
    queryFn: getOrgStores,
    enabled,
  });
}

export function useOrgMembers(enabled = true) {
  return useSafeQuery<OrgMember[], Error>({
    queryKey: teamKeys.members(),
    queryFn: listMembers,
    enabled,
  });
}

/**
 * Membership edits change what the *caller* may reach when they edit their own
 * row, and the sidebar reads the context query — so both keys are invalidated.
 * Only `members` was before, which left the nav showing sections the API had
 * just revoked until a reload.
 */
function invalidateTeam(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: teamKeys.members() });
  queryClient.invalidateQueries({ queryKey: teamKeys.context() });
}

export function useUpdateMember(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({
      memberId,
      input,
    }: {
      memberId: string;
      input: { role?: string; storeIds?: string[]; permissions?: string[] };
    }) => updateMember(memberId, input),
    onSuccess: () => {
      invalidateTeam(queryClient);
      options?.onSuccess?.();
    },
  });
}

export function useRemoveMember(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      invalidateTeam(queryClient);
      options?.onSuccess?.();
    },
  });
}

export function useCreateStaffAccount(options?: {
  onSuccess?: (data: CreatedStaff) => void;
}) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: createStaffAccount,
    onSuccess: (data) => {
      invalidateTeam(queryClient);
      options?.onSuccess?.(data);
    },
  });
}
