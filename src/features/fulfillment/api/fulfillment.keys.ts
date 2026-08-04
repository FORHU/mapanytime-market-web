export const fulfillmentKeys = {
  all: ["fulfillment"] as const,
  shipments: () => [...fulfillmentKeys.all, "shipments"] as const,
  shipmentByOrder: (orderId: string) =>
    [...fulfillmentKeys.shipments(), orderId] as const,
  returns: () => [...fulfillmentKeys.all, "returns"] as const,
  sellerReturns: (sellerId: string) =>
    [...fulfillmentKeys.returns(), "seller", sellerId] as const,
} as const;
