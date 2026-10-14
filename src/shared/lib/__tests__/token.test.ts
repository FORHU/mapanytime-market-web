import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, clearToken } from "../token";

const TOKEN_KEY = "token";
/** Older builds kept a JWT refresh token here; the API no longer issues one. */
const LEGACY_REFRESH_TOKEN_KEY = "refresh_token";

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "has_session=; path=/; Max-Age=0";
  });

  it("writes the token to sessionStorage", () => {
    setToken("access-1");

    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("access-1");
  });

  /**
   * The point of the sessionStorage move. If a future edit reintroduces a
   * localStorage write, the token outlives the tab again and this fails.
   */
  it("never writes a token to localStorage", () => {
    setToken("access-1");

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("reads back what it wrote", () => {
    setToken("access-1");

    expect(getToken()).toBe("access-1");
  });

  it("sets the has_session marker cookie on write and drops it on clear", () => {
    setToken("access-1");
    expect(document.cookie).toContain("has_session=1");

    clearToken();
    expect(document.cookie).not.toContain("has_session=1");
  });

  it("clears the token from sessionStorage", () => {
    setToken("access-1");
    clearToken();

    expect(getToken()).toBeNull();
  });

  /**
   * Tokens written by pre-sessionStorage builds must not be adopted — they have
   * already had an unbounded exposure window, so the user re-authenticates once.
   */
  it("purges a legacy localStorage token instead of migrating it", () => {
    localStorage.setItem(TOKEN_KEY, "stale-access");

    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  /**
   * Since the move to Better Auth sessions (API #122) nothing reads a refresh
   * token, so one left by an earlier build is a dead credential — removed on the
   * next read, from either store.
   */
  it("purges a refresh token left by an earlier build", () => {
    localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "stale-refresh");
    sessionStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "stale-refresh");

    getToken();

    expect(localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("clearToken also removes legacy entries", () => {
    localStorage.setItem(TOKEN_KEY, "stale-access");
    localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "stale-refresh");
    sessionStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "stale-refresh");

    clearToken();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
  });
});
