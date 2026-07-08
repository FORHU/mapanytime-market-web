/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "orders",
  dependsOn: ["auth"] as const,
  exposes: ["useOrders", "useCreateOrder", "useOrderStatus"] as const,
} as const;

export type OrdersManifest = typeof featureManifest;
