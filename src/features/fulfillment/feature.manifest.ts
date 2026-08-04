/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "fulfillment",
  dependsOn: [] as const,
  exposes: [
    "useShipmentByOrder",
    "useCreateShipment",
    "useUpdateShipmentStatus",
    "useSellerReturns",
    "useUpdateReturnStatus",
  ] as const,
} as const;

export type FulfillmentManifest = typeof featureManifest;
