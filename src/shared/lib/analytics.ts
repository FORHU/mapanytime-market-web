import { API_BASE_URL } from "@/shared/config/api";
import { getToken } from "@/shared/lib/token";

const SESSION_KEY = "mapanytime_analytics_session_id";

/**
 * Must stay a subset of the API's ANALYTICSEVENTTYPE enum (prisma/schema.prisma)
 * — the ingestion endpoint validates against it with Joi and 400s anything else.
 * See mapanytime-api/docs/payments-rework-review.md §9.
 */
export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "STORE_VIEW"
  | "PRODUCT_VIEW"
  | "PRODUCT_CLICK"
  | "SEARCH"
  | "ADD_TO_CART"
  | "ADD_TO_WISHLIST"
  | "CHECKOUT_STARTED"
  | "ORDER_COMPLETED";

/**
 * Anonymous, per-tab id. sessionStorage rather than localStorage so it shares a
 * lifetime with the auth token (see shared/lib/token.ts) instead of following a
 * visitor indefinitely.
 */
export const getSessionId = (): string => {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    // crypto.randomUUID rather than the `uuid` package: it is available in every
    // browser this app targets, and `uuid` was never a declared dependency here.
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Dropped on logout so the id does not outlive the credential it was minted
 * alongside. Without this the next user to sign in on the same tab inherits it,
 * and both users' events stitch into one analytics session under two userIds.
 *
 * Removal rather than re-minting: getSessionId() already mints lazily, so the
 * next tracked event issues a fresh id and a signed-out visitor who never fires
 * one costs nothing.
 */
export const clearSessionId = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
};

export const trackEvent = async (
  eventType: AnalyticsEventType,
  payload?: {
    storeId?: string;
    productId?: string;
    categoryId?: string;
    metadata?: Record<string, unknown>;
  },
) => {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getSessionId();
    // Not routed through shared/lib/http.ts's fetcher: that helper treats a
    // 401 as a reason to attempt token refresh and redirect to /login, which
    // must never happen because of a background analytics call. Attach the
    // token manually instead, so a signed-in user's events still carry userId
    // (analytics.controller.ts reads it from req.user) without inheriting
    // fetcher's auth-failure side effects.
    const token = getToken();

    // `/api/v1`, not `/v1` — NEXT_PUBLIC_API_URL is an origin with no path and
    // routes.ts is mounted at app.use('/api', router).
    await fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        eventType,
        sessionId,
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
      // Page views fire on navigation, which can race the document unload.
      keepalive: true,
    });
  } catch (err) {
    // Analytics must never block or break a navigation.
    console.error("Analytics tracking failed:", err);
  }
};
