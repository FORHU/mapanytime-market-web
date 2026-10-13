/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "app-releases",
  dependsOn: [] as const,
  exposes: [
    "useLatestRelease",
    "useReleaseHistory",
    "useAdminReleases",
    "useUploadRelease",
    "ReleaseUploadForm",
    "ReleaseList",
  ] as const,
} as const;

export type AppReleasesManifest = typeof featureManifest;
