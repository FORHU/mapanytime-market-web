/**
 * FAOS v5 — Feature Manifest
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 *
 * `exposes` mirrors ./index.ts, which is deliberately narrower than the feature:
 * StoreOnboardingForm and StoreManagementDashboard are imported from their own
 * paths so the barrel does not drag mapbox-gl into pages with no map.
 */
export const featureManifest = {
  name: "stores",
  dependsOn: [] as const,
  exposes: ["StoreTypeSelectionModal", "useActiveStore", "StoreType"] as const,
} as const;
export type StoresManifest = typeof featureManifest;
