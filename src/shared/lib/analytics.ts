import { API_BASE_URL } from "@/shared/config/api";

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

  const sessionId = getSessionId();

  try {
    // `/api/v1`, not `/v1` — NEXT_PUBLIC_API_URL is an origin with no path and
    // routes.ts is mounted at app.use('/api', router).
    await fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
