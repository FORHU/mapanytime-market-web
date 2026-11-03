import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import { getToken } from "@/shared/lib/token";
import { clearClientSession } from "@/shared/lib/session";
import { claimSignOut } from "@/shared/lib/session-state";

function classify(
  status: number,
):
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER"
  | "NETWORK"
  | "UNKNOWN" {
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

let onTokenClearCallback: (() => void) | null = null;
export function setOnTokenClear(cb: () => void) {
  onTokenClearCallback = cb;
}

/**
 * Calls the API with the stored bearer token.
 *
 * There is no refresh step. The API moved from JWT access/refresh tokens to
 * Better Auth sessions (API #122): a session lasts 30 days and slides forward
 * with use, so a 401 means the session is over — signed out, superseded by a
 * sign-in on another device, or expired — and the only answer is signing in
 * again. The refresh-and-retry queue that used to live here is gone with it.
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(env.NEXT_PUBLIC_API_URL.includes("ngrok")
        ? { "ngrok-skip-browser-warning": "true" }
        : {}),
      ...(options?.headers || {}),
    };

    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let payload: any = null;

      try {
        payload = await res.json();
      } catch {}

      const category = classify(res.status);
      const message = payload?.message || "Request failed";

      // Status only. This used to also substring-match the server's prose for
      // "invalid token" / "user not found" / "deactivated" / "unauthorized",
      // which was compensation for an era when a deactivated account answered
      // 404. auth.middleware.ts now makes every authentication rejection a 401
      // deliberately, so the heuristic is obsolete — and "unauthorized" collides
      // with authorization: a 403 like "Unauthorized store access." was read as
      // a dead session.
      //
      // A 403 must fall through to the ApiError throw so callers see it.
      const isAuthError = res.status === 401;

      // A 401 ends the session — except from /auth/login itself, where it is just
      // a wrong password and the form shows the message.
      if (isAuthError && !url.includes("/auth/login")) {
        // Clear the session and report. clearClientSession owns the full list
        // of what a sign-out removes (token, store context, analytics session id).
        if (typeof window !== "undefined") {
          clearClientSession();
          if (onTokenClearCallback) {
            onTokenClearCallback();
          }

          // This layer only reports; AuthListener owns clearing and routing.
          // Two layers redirecting at once (a document navigation racing an RSC
          // navigation) cancelled each other, which is why login?_rsc requests
          // used to sit pending forever.
          if (claimSignOut()) {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          }
        }
      }

      const retryAfterHeader = res.headers.get("retry-after");
      const retryAfterSeconds = retryAfterHeader
        ? parseInt(retryAfterHeader, 10)
        : undefined;

      throw new ApiError(message, category, {
        status: res.status,
        code: payload?.code,
        details: payload?.details,
        retryAfter: !isNaN(retryAfterSeconds as number)
          ? retryAfterSeconds
          : undefined,
      });
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new ApiError("Network error", "NETWORK");
    }
    throw err;
  }
}
