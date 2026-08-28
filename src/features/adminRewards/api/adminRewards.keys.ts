export const adminRewardsKeys = {
  all: ["admin", "rewards"] as const,
  config: () => [...adminRewardsKeys.all, "config"] as const,
  vouchers: () => [...adminRewardsKeys.all, "vouchers"] as const,
} as const;
