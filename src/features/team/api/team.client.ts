import { fetcher } from "@/shared/lib/http";
import {
  OrgContextSchema,
  OrgStoreSchema,
  OrgMemberSchema,
  CreatedStaffSchema,
  type OrgContext,
  type OrgStore,
  type OrgMember,
  type CreateStaffInput,
  type CreatedStaff,
} from "../contracts/team.contract";

const ORG_BASE = "/api/v1/seller/org";

export const getOrgContext = async (): Promise<OrgContext> => {
  const res = await fetcher<{ data: unknown }>(`${ORG_BASE}/context`);
  return OrgContextSchema.parse(res.data);
};

export const getOrgStores = async (): Promise<OrgStore[]> => {
  const res = await fetcher<{ data: unknown }>(`${ORG_BASE}/stores`);
  return OrgStoreSchema.array().parse(res.data);
};

export const listMembers = async (): Promise<OrgMember[]> => {
  const res = await fetcher<{ data: unknown }>(`${ORG_BASE}/members`);
  return OrgMemberSchema.array().parse(res.data);
};

export const updateMember = async (
  memberId: string,
  input: { role?: string; storeIds?: string[]; permissions?: string[] },
): Promise<OrgMember> => {
  const res = await fetcher<{ data: unknown }>(
    `${ORG_BASE}/members/${encodeURIComponent(memberId)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return OrgMemberSchema.parse(res.data);
};

export const deleteMember = async (memberId: string): Promise<void> => {
  await fetcher<{ data: unknown }>(
    `${ORG_BASE}/members/${encodeURIComponent(memberId)}`,
    {
      method: "DELETE",
    },
  );
};

/**
 * Creates the user, their membership and their store assignments together.
 * Distinct from `createMember`, which attaches somebody who already has an
 * account.
 */
export const createStaffAccount = async (
  input: CreateStaffInput,
): Promise<CreatedStaff> => {
  const res = await fetcher<{ data: unknown }>(`${ORG_BASE}/members/create`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return CreatedStaffSchema.parse(res.data);
};
