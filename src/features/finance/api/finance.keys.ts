export const financeKeys = {
  all: ["finance"] as const,
  settlements: () => [...financeKeys.all, "settlements"] as const,
  sellerSettlements: (sellerId: string) =>
    [...financeKeys.settlements(), "seller", sellerId] as const,
  orderSettlement: (orderId: string) =>
    [...financeKeys.settlements(), "order", orderId] as const,
  payouts: () => [...financeKeys.all, "payouts"] as const,
  sellerPayouts: (sellerId: string) =>
    [...financeKeys.payouts(), "seller", sellerId] as const,
} as const;
