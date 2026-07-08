export const ordersKeys = {
  all: ["orders"] as const,
  lists: (storeId: string) => [...ordersKeys.all, "list", storeId] as const,
  status: (orderId: string) => [...ordersKeys.all, "status", orderId] as const,
} as const;
