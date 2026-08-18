const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const SESSION_COOKIE = "has_session";

/**
 * Tokens live in sessionStorage, not localStorage.
 *
 * This is a blast-radius reduction, NOT XSS protection — script running on this
 * origin reads sessionStorage exactly as easily as localStorage. What changes is
 * lifetime and scope: the token dies with the tab instead of persisting
 * indefinitely, and it is not shared with other tabs, so a token picked up in
 * one tab does not outlive the work that needed it. Removing JS access entirely
 * needs HttpOnly cookies, which this stack cannot adopt unilaterally while the
 * Flutter app authenticates with bearer tokens.
 *
 * Consequence to know about: a new tab starts with no token. `has_session` is a
 * cookie and cookies ARE shared across tabs, so middleware.ts will admit that
 * tab to /seller or /admin, the first API call 401s, and the user lands back on
 * /login. That is a redirect, not a broken state, but it is why signing in
 * again per tab is expected behaviour now.
 */

/**
 * Tokens written by earlier builds sit in localStorage forever. Clear them on
 * every read so a stale credential isn't left in the more persistent store.
 * Unconditional rather than memoised on purpose: removeItem on an absent key is
 * free, and a one-shot flag would make the behaviour order-dependent.
 * They are deliberately NOT migrated into sessionStorage — those values have
 * already had a long exposure window, so re-authenticating once is the point.
 */
function purgeLegacyStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  purgeLegacyStorage();
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  purgeLegacyStorage();
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setToken(token: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  // Deliberately left without Max-Age: a session cookie is the closest a cookie
  // gets to sessionStorage's lifetime, so the marker expires roughly when the
  // credential it stands for does. See docs/connection-audit.md §4.
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; Max-Age=0`;
}
