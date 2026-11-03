import { endSignOut, publishSessionChange } from "@/shared/lib/session-state";

const TOKEN_KEY = "token";
/**
 * Where the JWT refresh token used to live. The API no longer issues one (it
 * moved to Better Auth sessions, API #122), so nothing writes this key any more —
 * it is only ever removed, so a refresh token left by an earlier build does not
 * linger in storage.
 */
const LEGACY_REFRESH_TOKEN_KEY = "refresh_token";
const SESSION_COOKIE = "has_session";

/**
 * The token lives in sessionStorage, not localStorage.
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
 * Tokens written by earlier builds sit in localStorage forever, and older builds
 * also kept a refresh token. Clear them on every read so a stale credential
 * isn't left behind. Unconditional rather than memoised on purpose: removeItem
 * on an absent key is free, and a one-shot flag would make the behaviour
 * order-dependent. They are deliberately NOT migrated — re-authenticating once
 * is the point.
 */
function purgeLegacyStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  purgeLegacyStorage();
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  // Deliberately left without Max-Age: a session cookie is the closest a cookie
  // gets to sessionStorage's lifetime, so the marker expires roughly when the
  // credential it stands for does. See docs/connection-audit.md §4.
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;

  // A new credential is the one thing that ends a sign-out, so the release lives
  // here rather than at any call site — sign-in and set-password both route
  // through setToken and neither can forget.
  endSignOut();
  publishSessionChange();
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; Max-Age=0`;

  // Notify, but do NOT endSignOut() — clearing is what a sign-out *is*. Only a
  // new credential releases the latch.
  publishSessionChange();
}

/**
 * Marker cookie for the seller account-setup link. The admin's link lands on
 * /set-password?email=...&code=...; setting `has_session` here keeps middleware
 * from bouncing the user out of /seller after they set a password. Same
 * session-scoped pattern as setToken (no Max-Age).
 */
export function setSetupSessionCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
}
