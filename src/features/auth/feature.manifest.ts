export const featureManifest = {
  name: "auth",
  dependsOn: [] as const,
  exposes: ["useAuthStore", "SellerAuthGate"] as const,
} as const;

export type AuthManifest = typeof featureManifest;
