/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "seller-analytics",
  dependsOn: [] as const,
  exposes: ["SellerAnalyticsWorkspace"] as const,
} as const;

export type SellerAnalyticsManifest = typeof featureManifest;
