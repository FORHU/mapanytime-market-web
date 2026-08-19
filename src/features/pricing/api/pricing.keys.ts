import type { CalculatePricingInput } from "../contracts/pricing.contract";

export const pricingKeys = {
  all: ["pricing"] as const,
  active: () => [...pricingKeys.all, "active"] as const,
  configurations: () => [...pricingKeys.all, "configurations"] as const,
  simulation: (input: CalculatePricingInput) =>
    [...pricingKeys.all, "simulation", input] as const,
} as const;
