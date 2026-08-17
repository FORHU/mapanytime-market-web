/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "store-profile",
  dependsOn: ["auth"] as const,
  exposes: [
    "StoreProfileSettings",
    "StoreProfileView",
    "useStoreProfile",
    "useStoreProfiles",
    "useStoreCategories",
    "useUpdateStoreProfile",
  ] as const,
} as const;

export type StoreProfileManifest = typeof featureManifest;
