import type { StoreType } from "../types";

export function getOnboardingDraftKey(storeType?: StoreType): string {
  return storeType
    ? `seller-onboarding-draft:${storeType}`
    : "seller-onboarding-draft";
}

export function clearOnboardingDraft(storeType?: StoreType): void {
  try {
    localStorage.removeItem(getOnboardingDraftKey(storeType));

    // Remove the key used by the original House/Lot frontend stub as well.
    if (storeType === "house-lot") {
      localStorage.removeItem("seller-onboarding-draft:house-lot-stub");
    }
  } catch {
    // Storage may be unavailable in private browsing or restricted environments.
  }
}
