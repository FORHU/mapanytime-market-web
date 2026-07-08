import { fetcher } from "@/shared/lib/http";

export interface OnboardingPayload {
  storeName: string;
  storeHours: string;
  parentCategory: string;
  lat: number;
  lng: number;
  govIdKey: string;
  mayorsPermitKey: string;
  dtiKey: string;
  tinKey: string;
}

/**
 * Backend integration toggle (same convention as features/orders/api/orders.client.ts).
 * No /api/onboarding/submit route exists yet — flip to true once the backend
 * team confirms the endpoint and payload shape below.
 */
const USE_LIVE_BACKEND = false;

export const submitOnboarding = async (
  payload: OnboardingPayload,
): Promise<{ storeId: string }> => {
  if (!USE_LIVE_BACKEND) {
    return Promise.resolve({ storeId: `store_${Date.now()}` });
  }

  return fetcher<{ storeId: string }>("/api/onboarding/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
