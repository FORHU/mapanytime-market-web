export const featureManifest = {
  name: "inventory",
  dependsOn: ["auth"] as const,
  exposes: ["InventoryList", "InventoryDetail", "useInventoryItems"] as const,
} as const;

export type InventoryManifest = typeof featureManifest;
