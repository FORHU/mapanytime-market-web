import { clearToken } from "@/shared/lib/token";
import { clearSessionId } from "@/shared/lib/analytics";

/**
 * Per-user state that must not survive a session change. Not the theme, and not
 * onboarding drafts: those belong to the browser and to unsubmitted user work
 * respectively, and wiping them turns a sign-out into data loss.
 */
const SCOPED_STORAGE_KEYS = [
  "active_store_context_id",
  "active_property_context_id",
] as const;

/**
 * The one place a client session is torn down.
 *
 * Three call sites used to keep their own copy of this list and drifted apart:
 * the forced-logout path in http.ts dropped only the store context, so the
 * property context leaked across users, and none of them dropped the analytics
 * session id at all (see clearSessionId in analytics.ts for what that cost).
 *
 * Storage only — the React Query cache is not reachable from here. Callers that
 * hold a QueryClient must still clear() it; see clearAuthSession in
 * features/auth/hooks/useAuth.ts.
 *
 * Must never import http.ts: auth.store.ts already imports it, which would
 * close a cycle.
 */
export function clearClientSession(): void {
  if (typeof window === "undefined") return;

  clearToken();
  SCOPED_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  clearSessionId();
}
