export const rewardsKeys = {
  all: ["rewards"] as const,
  wallet: () => [...rewardsKeys.all, "wallet"] as const,
  config: () => [...rewardsKeys.all, "config"] as const,
  vouchers: () => [...rewardsKeys.all, "vouchers"] as const,
  myVouchers: (status?: string) =>
    [...rewardsKeys.all, "my-vouchers", status ?? "all"] as const,
  transactions: (page: number, type?: string) =>
    [...rewardsKeys.all, "transactions", page, type ?? "all"] as const,
} as const;
