import { fetcher } from "@/shared/lib/http";
import {
  AdminInvite,
  AdminInviteSchema,
  AdminInvitesPage,
  AdminInvitesPageSchema,
  ValidateInviteData,
  ValidateInviteDataSchema,
  AcceptInviteData,
  AcceptInviteDataSchema,
} from "../contracts/adminInvite.contract";

export async function listAdminInvites(
  params?: {
    status?: string;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<AdminInvitesPage> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") {
    query.set("status", params.status);
  }
  if (params?.page) {
    query.set("page", String(params.page));
  }
  if (params?.limit) {
    query.set("limit", String(params.limit));
  }

  const qs = query.toString();
  const url = `/api/v1/admin/invites${qs ? `?${qs}` : ""}`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AdminInvitesPageSchema.parse(response.data);
}

export async function createAdminInvite(
  params: {
    email: string;
    role?: string;
    expiresInDays?: number;
  },
  signal?: AbortSignal,
): Promise<AdminInvite> {
  const response = await fetcher<{ data: unknown }>("/api/v1/admin/invites", {
    method: "POST",
    body: JSON.stringify(params),
    signal,
  });
  return AdminInviteSchema.parse(response.data);
}

export async function revokeAdminInvite(
  inviteId: string,
  signal?: AbortSignal,
): Promise<AdminInvite> {
  const response = await fetcher<{ data: unknown }>(
    `/api/v1/admin/invites/${inviteId}/revoke`,
    {
      method: "POST",
      body: JSON.stringify({}),
      signal,
    },
  );
  return AdminInviteSchema.parse(response.data);
}

export async function validateAdminInvite(
  token: string,
  signal?: AbortSignal,
): Promise<ValidateInviteData> {
  const query = new URLSearchParams({ token: token.trim() });
  const response = await fetcher<{ data: unknown }>(
    `/api/v1/admin/invites/validate?${query.toString()}`,
    { signal },
  );
  return ValidateInviteDataSchema.parse(response.data);
}

export async function acceptAdminInvite(
  params: {
    token: string;
    password: string;
    firstName?: string;
    lastName?: string;
  },
  signal?: AbortSignal,
): Promise<AcceptInviteData> {
  const response = await fetcher<{ data: unknown }>(
    "/api/v1/admin/invites/accept",
    {
      method: "POST",
      body: JSON.stringify(params),
      signal,
    },
  );
  return AcceptInviteDataSchema.parse(response.data);
}

