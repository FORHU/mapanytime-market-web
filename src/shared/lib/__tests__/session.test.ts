import { describe, it, expect, beforeEach } from "vitest";
import { clearClientSession } from "../session";
import { setToken, getToken, getRefreshToken } from "../token";
import { getSessionId } from "../analytics";

const ANALYTICS_SESSION_KEY = "mapanytime_analytics_session_id";
const STORE_CONTEXT_KEY = "active_store_context_id";
const PROPERTY_CONTEXT_KEY = "active_property_context_id";

describe("clearClientSession", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "has_session=; path=/; Max-Age=0";
  });

  /** Signs in and populates every key a live session accumulates. */
  function seedSession() {
    setToken("access-1", "refresh-1");
    localStorage.setItem(STORE_CONTEXT_KEY, "store-1");
    localStorage.setItem(PROPERTY_CONTEXT_KEY, "property-1");
    getSessionId(); // mints the analytics id the way a tracked event would
  }

  it("clears both tokens and the has_session marker cookie", () => {
    seedSession();

    clearClientSession();

    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(document.cookie).not.toContain("has_session=1");
  });

  /**
   * The regression this function exists for. The analytics session id is the key
   * the ingestion endpoint groups events by; leaving it behind stitched the next
   * user's events into the previous user's session.
   */
  it("removes the analytics session id", () => {
    seedSession();
    expect(sessionStorage.getItem(ANALYTICS_SESSION_KEY)).not.toBeNull();

    clearClientSession();

    expect(sessionStorage.getItem(ANALYTICS_SESSION_KEY)).toBeNull();
  });

  /**
   * Both keys, not just the store one. The forced-logout path in http.ts used to
   * drop only active_store_context_id.
   */
  it("removes both seller context keys", () => {
    seedSession();

    clearClientSession();

    expect(localStorage.getItem(STORE_CONTEXT_KEY)).toBeNull();
    expect(localStorage.getItem(PROPERTY_CONTEXT_KEY)).toBeNull();
  });

  /**
   * Guards against a future edit reaching for localStorage.clear(): the theme is
   * the browser's, and an onboarding draft is unsubmitted user work.
   */
  it("leaves storage that does not belong to the session alone", () => {
    seedSession();
    localStorage.setItem("theme", "dark");
    localStorage.setItem("seller-onboarding-draft:retail", '{"step":2}');

    clearClientSession();

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("seller-onboarding-draft:retail")).toBe(
      '{"step":2}',
    );
  });

  it("mints a fresh analytics id afterwards rather than reusing the old one", () => {
    seedSession();
    const before = sessionStorage.getItem(ANALYTICS_SESSION_KEY);

    clearClientSession();
    const after = getSessionId();

    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });
});
