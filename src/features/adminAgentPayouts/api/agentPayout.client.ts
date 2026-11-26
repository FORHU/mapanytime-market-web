import { fetcher } from "@/shared/lib/http";
import {
  AgentPayoutsPage,
  AgentPayoutsPageSchema,
  AgentCommissionConfig,
  AgentCommissionConfigSchema,
  AgentPayoutItem,
  AgentPayoutItemSchema,
  AgentPayoutStatus,
} from "../contracts/agentPayout.contract";

export async function listAdminAgentPayouts(
  params?: {
    page?: number;
    limit?: number;
    status?: AgentPayoutStatus | "ALL";
    search?: string;
  },
  signal?: AbortSignal,
): Promise<AgentPayoutsPage> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.search && params.search.trim()) query.set("search", params.search.trim());

  const qs = query.toString();
  const url = `/api/v1/agent/admin/payouts${qs ? `?${qs}` : ""}`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AgentPayoutsPageSchema.parse(response.data);
}

export async function getAgentCommissionConfig(
  signal?: AbortSignal,
): Promise<AgentCommissionConfig> {
  const url = `/api/v1/agent/commission/config`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AgentCommissionConfigSchema.parse(response.data);
}

export async function approveAgentPayout(
  id: string,
  reference?: string,
): Promise<AgentPayoutItem> {
  const url = `/api/v1/agent/admin/payouts/${id}/approve`;
  const response = await fetcher<{ data: unknown }>(url, {
    method: "POST",
    body: JSON.stringify({ reference: reference?.trim() || undefined }),
  });
  return AgentPayoutItemSchema.parse(response.data);
}

export async function rejectAgentPayout(
  id: string,
  reason?: string,
): Promise<AgentPayoutItem> {
  const url = `/api/v1/agent/admin/payouts/${id}/reject`;
  const response = await fetcher<{ data: unknown }>(url, {
    method: "POST",
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
  return AgentPayoutItemSchema.parse(response.data);
}
