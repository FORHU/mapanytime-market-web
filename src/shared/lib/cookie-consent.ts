const CONSENT_COOKIE = "cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type CookieConsent = "accepted" | "rejected";

/**
 * Consent is stored in a plain, non-httpOnly cookie so any page load can
 * decide whether to show the banner without a server round-trip.
 *
 * No analytics are loaded yet — this banner and cookie are the consent
 * foundation that future tracking scripts (GA/GTM) should be gated behind:
 * only load them when getConsent() === "accepted".
 */
export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  const value = match?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

export function setConsent(choice: CookieConsent): void {
  if (typeof window === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax`;
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}
