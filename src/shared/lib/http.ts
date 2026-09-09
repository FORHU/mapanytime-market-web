import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import { getToken, getRefreshToken, setToken } from "@/shared/lib/token";
import { clearClientSession } from "@/shared/lib/session";

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

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];
// Parallel to `refreshSubscribers`: a queued request must be failed, not left
// pending, when the refresh it is waiting on turns out to fail.
let refreshRejecters: ((reason: unknown) => void)[] = [];

let onTokenRefreshCallback:
  ((token: string, refreshToken?: string) => void) | null = null;
export function setOnTokenRefresh(
  cb: (token: string, refreshToken?: string) => void,
) {
  onTokenRefreshCallback = cb;
}

let onTokenClearCallback: (() => void) | null = null;
export function setOnTokenClear(cb: () => void) {
  onTokenClearCallback = cb;
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
  refreshRejecters = [];
}

/**
 * Fail everything queued behind a refresh that did not produce a token.
 *
 * Without this the subscribers were simply dropped: `onRefreshed` never ran, so
 * every queued promise stayed pending forever and the queries behind them span
 * on a skeleton with no error and no timeout.
 */
function onRefreshFailed(reason: unknown) {
  refreshRejecters.forEach((reject) => reject(reason));
  refreshSubscribers = [];
  refreshRejecters = [];
}

async function tryRefreshToken(): Promise<string | null> {
  const existingRefreshToken = getRefreshToken();
  if (!existingRefreshToken) return null;

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: existingRefreshToken }),
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    const newAccessToken = data?.accessToken;
    const newRefreshToken = data?.refreshToken || existingRefreshToken;

    if (newAccessToken) {
      setToken(newAccessToken, newRefreshToken);
      if (onTokenRefreshCallback) {
        onTokenRefreshCallback(newAccessToken, newRefreshToken);
      }
      return newAccessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * `attempt` is internal bookkeeping, not part of the calling contract: it is how
 * the post-refresh retry below tells itself apart from the original request.
 * Only attempt 0 may refresh, so a request can be retried at most once.
 *
 * It exists because the retry used to be unguarded self-recursion. Any response
 * that kept failing after a SUCCESSFUL refresh — an authorization error, say —
 * looped forever: refresh, retry, fail, refresh, with no backoff and no ceiling.
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit,
  attempt = 0,
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
      // a dead session, refreshed (successfully, the session was fine), retried,
      // and 403'd again, forever.
      //
      // A 403 must fall through to the ApiError throw so callers see it.
      const isAuthError = res.status === 401;

      // Attempt automatic JWT refresh token rotation before forcing a logout.
      // Only on the first attempt: a retry that still fails is not a token
      // problem, and refreshing again would just restart the cycle.
      if (
        isAuthError &&
        attempt === 0 &&
        !url.includes("/auth/refresh-token") &&
        !url.includes("/auth/login")
      ) {
        const storedRefreshToken = getRefreshToken();
        if (storedRefreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await tryRefreshToken();
            isRefreshing = false;

            if (newToken) {
              onRefreshed(newToken);
              return fetcher<T>(url, options, attempt + 1);
            }

            // Release the queue before falling through to the logout below,
            // so waiters fail with this error instead of hanging.
            onRefreshFailed(
              new ApiError(message, category, { status: res.status }),
            );
          } else {
            // Queue concurrent requests while token refresh is in flight
            return new Promise((resolve, reject) => {
              refreshRejecters.push(reject);
              refreshSubscribers.push((newToken: string) => {
                fetcher<T>(
                  url,
                  {
                    ...options,
                    headers: {
                      ...options?.headers,
                      Authorization: `Bearer ${newToken}`,
                    },
                  },
                  attempt + 1,
                )
                  .then(resolve)
                  .catch(reject);
              });
            });
          }
        }

        // Refresh failed or no refresh token exists -> clear the session and redirect.
        // Was clearToken() plus a hand-written removeItem for the store context only,
        // which left active_property_context_id and the analytics session id behind
        // for whoever signed in next. clearClientSession owns the full list now.
        if (typeof window !== "undefined") {
          clearClientSession();
          if (onTokenClearCallback) {
            onTokenClearCallback();
          }

          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }

      throw new ApiError(message, category, {
        status: res.status,
        code: payload?.code,
        details: payload?.details,
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
