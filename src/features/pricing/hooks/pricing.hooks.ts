import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getActivePricing, calculatePricing } from "../api/pricing.client";
import { pricingKeys } from "../api/pricing.keys";
import type { CalculatePricingInput } from "../contracts/pricing.contract";

/** The fee configuration currently in force. */
export function useActivePricing() {
  return useSafeQuery({
    queryKey: pricingKeys.active(),
    queryFn: getActivePricing,
  });
}

/**
 * Server-side pricing preview. Kept as a query so repeated simulator input
 * settles on a cached result instead of re-posting on every keystroke.
 */
export function usePricingSimulation(
  input: CalculatePricingInput,
  enabled = true,
) {
  return useSafeQuery({
    queryKey: pricingKeys.simulation(input),
    queryFn: () => calculatePricing(input),
    enabled: enabled && input.subtotalAmount > 0,
    staleTime: 30_000,
  });
}
