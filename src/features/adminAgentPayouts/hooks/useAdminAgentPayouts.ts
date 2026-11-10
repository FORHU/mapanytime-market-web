import {
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  listAdminAgentPayouts,
  getAgentCommissionConfig,
  approveAgentPayout,
  rejectAgentPayout,
} from "../api/agentPayout.client";
import {
  AgentPayoutsPage,
  AgentCommissionConfig,
  AgentPayoutStatus,
} from "../contracts/agentPayout.contract";

export function useAdminAgentPayouts(params?: {
  page?: number;
  limit?: number;
  status?: AgentPayoutStatus | "ALL";
  search?: string;
}) {
  return useSafeQuery<AgentPayoutsPage, Error>({
    queryKey: [
      "admin",
      "agent-payouts",
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.status ?? "ALL",
      params?.search ?? "",
    ],
    queryFn: ({ signal }) => listAdminAgentPayouts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAgentCommissionConfig() {
  return useSafeQuery<AgentCommissionConfig, Error>({
    queryKey: ["admin", "agent-commission-config"],
    queryFn: ({ signal }) => getAgentCommissionConfig(signal),
  });
}

export function useApproveAgentPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reference }: { id: string; reference?: string }) =>
      approveAgentPayout(id, reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agent-payouts"] });
    },
  });
}

export function useRejectAgentPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectAgentPayout(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agent-payouts"] });
    },
  });
}
