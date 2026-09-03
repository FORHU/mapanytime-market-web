/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.mjs.
 */
export const featureManifest = {
  name: "landing",
  dependsOn: [] as const,
  exposes: [
    "LandingNav",
    "LandingHero",
    "LandingStats",
    "LandingHowItWorks",
    "LandingBenefits",
    "LandingStory",
    "LandingTestimonial",
    "LandingCTA",
    "LandingFooter",
  ] as const,
} as const;

export type LandingManifest = typeof featureManifest;
