// Talks to the API's pricing module (mapanytime-api/src/modules/pricing).
// /active and /calculate are open; /configurations requires a bearer token.
import { fetcher } from "@/shared/lib/http";
import {
  ActivePricingSchema,
  PricingCalculationSchema,
  type ActivePricing,
  type CalculatePricingInput,
  type PricingCalculation,
} from "../contracts/pricing.contract";

/** Live fee configuration, or the engine's fallback rates when none is stored. */
export const getActivePricing = async (): Promise<ActivePricing> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/pricing/active");
  return ActivePricingSchema.parse(raw.data);
};

/** Runs an order through the real pricing engine — no client-side arithmetic. */
export const calculatePricing = async (
  input: CalculatePricingInput,
): Promise<PricingCalculation> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/pricing/calculate", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return PricingCalculationSchema.parse(raw.data);
};
