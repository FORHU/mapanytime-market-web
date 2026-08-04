/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "finance",
  dependsOn: [] as const,
  exposes: [
    "useSellerSettlements",
    "useSellerPayouts",
    "useSellerEarnings",
    "useCreatePayout",
    "useUpdatePayoutStatus",
  ] as const,
} as const;

export type FinanceManifest = typeof featureManifest;
