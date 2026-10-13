import { describe, it, expect, beforeEach } from "vitest";
import { getConsent, setConsent, hasConsent } from "../cookie-consent";

describe("cookie consent", () => {
  beforeEach(() => {
    document.cookie = "cookie_consent=; path=/; Max-Age=0";
  });

  it("returns null before a choice is made", () => {
    expect(getConsent()).toBeNull();
    expect(hasConsent()).toBe(false);
  });

  it("persists an accepted choice", () => {
    setConsent("accepted");

    expect(getConsent()).toBe("accepted");
    expect(hasConsent()).toBe(true);
    expect(document.cookie).toContain("cookie_consent=accepted");
  });

  it("persists a rejected choice", () => {
    setConsent("rejected");

    expect(getConsent()).toBe("rejected");
    expect(hasConsent()).toBe(true);
  });

  it("overwrites a prior choice", () => {
    setConsent("accepted");
    setConsent("rejected");

    expect(getConsent()).toBe("rejected");
  });

  it("reads the consent cookie even when other cookies are present", () => {
    setConsent("accepted");
    document.cookie = "has_session=1; path=/; SameSite=Lax";

    expect(getConsent()).toBe("accepted");
  });

  it("ignores an unexpected cookie value instead of trusting it", () => {
    document.cookie = "cookie_consent=maybe; path=/; Max-Age=31536000";

    expect(getConsent()).toBeNull();
    expect(hasConsent()).toBe(false);
  });
});
