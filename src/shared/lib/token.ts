/**
 * FAOS — Auth token storage (single source of truth)
 *
 * Both the HTTP layer (`shared/lib/http.ts`) and the auth store
 * (`features/auth/stores/auth.store.ts`) read/write the token through here,
 * so the two can never drift out of sync.
 *
 * ⚠️ SECURITY NOTE
 * This template persists the JWT in `sessionStorage` for portability with any
 * backend. `sessionStorage` is readable by any script on the page, so it is
 * vulnerable to XSS token theft. For production, prefer an httpOnly, Secure,
 * SameSite cookie set by your backend and drop this module. Swapping the four
 * functions below is the only change needed if you keep a client-side store.
 */

// Must match the key every feature's legacy fetch calls already read directly
// (localStorage.getItem("token")) — changing this without updating every call
// site would silently break auth everywhere at once.
const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
}
