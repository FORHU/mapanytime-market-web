import { fetcher } from "@/shared/lib/http";
import { z } from "zod";
import type {
  AgentOnboardingInput,
  AgentOnboardingResult,
  SellerRegistrationInput,
  SellerRegistrationResult,
} from "../types";

const registrationResponseSchema = z.object({
  data: z.object({
    sellerId: z.string(),
    userId: z.string(),
    email: z.string(),
    storeName: z.string(),
    businessEmail: z.string(),
    businessPhone: z.string(),
    temporaryPassword: z.string(),
    requiresOnboarding: z.boolean(),
  }),
});

const onboardingResponseSchema = z.object({
  data: z.object({
    sellerId: z.string(),
    storeId: z.string(),
    onboardingStep: z.number(),
    isOnboarded: z.boolean(),
    status: z.string(),
  }),
});

export async function registerSeller(
  input: SellerRegistrationInput,
): Promise<SellerRegistrationResult> {
  const raw = await fetcher<unknown>("/api/v1/agent/register-seller", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return registrationResponseSchema.parse(raw).data;
}

export async function completeSellerOnboarding(
  sellerId: string,
  input: AgentOnboardingInput,
): Promise<AgentOnboardingResult> {
  const raw = await fetcher<unknown>(
    `/api/v1/agent/sellers/${sellerId}/onboarding`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return onboardingResponseSchema.parse(raw).data;
}
