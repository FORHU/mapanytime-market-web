import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  claimSignOut,
  isSigningOut,
  endSignOut,
  subscribeSessionChange,
  publishSessionChange,
} from "@/shared/lib/session-state";
import { setToken, clearToken } from "@/shared/lib/token";

describe("session-state", () => {
  beforeEach(() => {
    // Module-level state: reset explicitly, or a latch set by one test silently
    // suppresses the next one.
    endSignOut();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe("claimSignOut", () => {
    it("grants the claim to exactly one caller per episode", () => {
      expect(claimSignOut()).toBe(true);
      expect(claimSignOut()).toBe(false);
      expect(claimSignOut()).toBe(false);
    });

    it("reports the in-flight state via isSigningOut", () => {
      expect(isSigningOut()).toBe(false);
      claimSignOut();
      expect(isSigningOut()).toBe(true);
      endSignOut();
      expect(isSigningOut()).toBe(false);
    });

    it("can be claimed again after the latch is released", () => {
      expect(claimSignOut()).toBe(true);
      endSignOut();
      expect(claimSignOut()).toBe(true);
    });
  });

  describe("latch release via the credential", () => {
    it("writing a new token releases the latch", () => {
      claimSignOut();
      expect(isSigningOut()).toBe(true);

      setToken("fresh-access-token", "fresh-refresh-token");

      expect(isSigningOut()).toBe(false);
    });

    it("clearing the token does NOT release the latch", () => {
      claimSignOut();
      clearToken();
      // Clearing is what a sign-out *is* — only a new credential ends one.
      expect(isSigningOut()).toBe(true);
    });
  });

  describe("subscribeSessionChange", () => {
    it("notifies subscribers when a token is written", () => {
      const listener = vi.fn();
      subscribeSessionChange(listener);

      setToken("abc");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("notifies subscribers when the token is cleared", () => {
      const listener = vi.fn();
      subscribeSessionChange(listener);

      clearToken();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("does NOT notify on a read — getToken must stay side-effect free", async () => {
      const { getToken } = await import("@/shared/lib/token");
      const listener = vi.fn();
      subscribeSessionChange(listener);

      getToken();

      expect(listener).not.toHaveBeenCalled();
    });

    it("stops notifying after unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = subscribeSessionChange(listener);

      publishSessionChange();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      publishSessionChange();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("notifies every subscriber", () => {
      const first = vi.fn();
      const second = vi.fn();
      subscribeSessionChange(first);
      subscribeSessionChange(second);

      publishSessionChange();

      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });
  });
});
