// TODO(backend): per-browser localStorage for now; move to `seller.onboardingStep` once the API writes it.

const KEY_PREFIX = "ma.seller.tour";

// Per-user key, deliberately not in SCOPED_STORAGE_KEYS so sign-out doesn't re-nag.
function storageKey(tourId: string, userId: string) {
  return `${KEY_PREFIX}.${tourId}.v1.${userId}`;
}

// Storage failures (SSR, private mode, blocked site data) degrade to "show the tour".
export function hasSeenTour(tourId: string, userId: string | null): boolean {
  if (typeof window === "undefined" || !userId) return false;
  try {
    return window.localStorage.getItem(storageKey(tourId, userId)) === "1";
  } catch {
    return false;
  }
}

export function markTourSeen(tourId: string, userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(storageKey(tourId, userId), "1");
  } catch {
    // Ignore — worst case the tour shows again next visit.
  }
}
