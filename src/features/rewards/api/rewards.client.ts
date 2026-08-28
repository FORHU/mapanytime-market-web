import { fetcher } from "@/shared/lib/http";
import {
  RewardWalletSchema,
  RewardConfigSchema,
  RewardVoucherSchema,
  UserVoucherSchema,
  RewardTransactionPageSchema,
  type RewardWallet,
  type RewardConfig,
  type RewardVoucher,
  type UserVoucher,
  type RewardTransactionPage,
} from "../contracts/rewards.contract";

export async function getWallet(): Promise<RewardWallet> {
  const res = await fetcher<{ data: unknown }>("/api/v1/rewards/wallet");
  return RewardWalletSchema.parse(res.data);
}

export async function getConfig(): Promise<RewardConfig> {
  const res = await fetcher<{ data: unknown }>("/api/v1/rewards/config");
  return RewardConfigSchema.parse(res.data);
}

export async function getVoucherCatalog(): Promise<RewardVoucher[]> {
  const res = await fetcher<{ data: unknown }>("/api/v1/rewards/vouchers");
  return RewardVoucherSchema.array().parse(res.data ?? []);
}

export async function claimVoucher(voucherId: string): Promise<UserVoucher> {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/rewards/vouchers/${voucherId}/claim`,
    { method: "POST" },
  );
  return UserVoucherSchema.parse(res.data);
}

export async function getMyVouchers(
  status?: "ACTIVE" | "USED" | "EXPIRED",
): Promise<UserVoucher[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/rewards/my-vouchers${query}`,
  );
  return UserVoucherSchema.array().parse(res.data ?? []);
}

export async function getTransactions(
  page = 1,
  limit = 20,
  type?: string,
): Promise<RewardTransactionPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type) params.set("type", type);
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/rewards/transactions?${params.toString()}`,
  );
  return RewardTransactionPageSchema.parse(res.data);
}
