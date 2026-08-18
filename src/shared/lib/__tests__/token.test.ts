import { describe, it, expect, beforeEach } from "vitest";
import { getToken, getRefreshToken, setToken, clearToken } from "../token";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "has_session=; path=/; Max-Age=0";
  });

  it("writes both tokens to sessionStorage", () => {
    setToken("access-1", "refresh-1");

    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("access-1");
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-1");
  });

  /**
   * The point of the sessionStorage move. If a future edit reintroduces a
   * localStorage write, the token outlives the tab again and this fails.
   */
  it("never writes a token to localStorage", () => {
    setToken("access-1", "refresh-1");

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("reads back what it wrote", () => {
    setToken("access-1", "refresh-1");

    expect(getToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("leaves an existing refresh token alone when only the access token rotates", () => {
    setToken("access-1", "refresh-1");
    setToken("access-2");

    expect(getToken()).toBe("access-2");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("sets the has_session marker cookie on write and drops it on clear", () => {
    setToken("access-1", "refresh-1");
    expect(document.cookie).toContain("has_session=1");

    clearToken();
    expect(document.cookie).not.toContain("has_session=1");
  });

  it("clears both tokens from sessionStorage", () => {
    setToken("access-1", "refresh-1");
    clearToken();

    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  /**
   * Tokens written by pre-sessionStorage builds must not be adopted — they have
   * already had an unbounded exposure window, so the user re-authenticates once.
   */
  it("purges a legacy localStorage token instead of migrating it", () => {
    localStorage.setItem(TOKEN_KEY, "stale-access");
    localStorage.setItem(REFRESH_TOKEN_KEY, "stale-refresh");

    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("clearToken also removes legacy localStorage entries", () => {
    localStorage.setItem(TOKEN_KEY, "stale-access");
    localStorage.setItem(REFRESH_TOKEN_KEY, "stale-refresh");

    clearToken();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });
});
