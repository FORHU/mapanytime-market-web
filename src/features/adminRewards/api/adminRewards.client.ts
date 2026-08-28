import { fetcher } from "@/shared/lib/http";
import {
  AdminRewardConfigSchema,
  AdminVoucherSchema,
  type AdminRewardConfig,
  type AdminVoucher,
  type UpdateRewardConfigInput,
  type CreateVoucherInput,
  type UpdateVoucherInput,
} from "../contracts/adminRewards.contract";

/** `null` when no config row has ever been saved — the platform is then
 * running on the API's hardcoded defaults. */
export async function getAdminRewardConfig(): Promise<AdminRewardConfig | null> {
  const res = await fetcher<{ data: unknown }>("/api/v1/rewards/admin/config");
  return AdminRewardConfigSchema.nullable().parse(res.data);
}

export async function updateRewardConfig(
  input: UpdateRewardConfigInput,
): Promise<AdminRewardConfig> {
  const res = await fetcher<{ data: unknown }>("/api/v1/rewards/admin/config", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return AdminRewardConfigSchema.parse(res.data);
}

export async function listAdminVouchers(): Promise<AdminVoucher[]> {
  const res = await fetcher<{ data: unknown }>(
    "/api/v1/rewards/admin/vouchers",
  );
  return AdminVoucherSchema.array().parse(res.data ?? []);
}

export async function createVoucher(
  input: CreateVoucherInput,
): Promise<AdminVoucher> {
  const res = await fetcher<{ data: unknown }>(
    "/api/v1/rewards/admin/vouchers",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return AdminVoucherSchema.parse(res.data);
}

export async function updateVoucher(
  id: string,
  input: UpdateVoucherInput,
): Promise<AdminVoucher> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/rewards/admin/vouchers/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return AdminVoucherSchema.parse(res.data);
}
