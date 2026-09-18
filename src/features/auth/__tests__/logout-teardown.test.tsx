import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { fetcher } from "@/shared/lib/http";
import { routeError } from "@/shared/errors/error-router";
import { clearAuthSession } from "../hooks/useAuth";
import { setToken, clearToken } from "@/shared/lib/token";
import { endSignOut, claimSignOut } from "@/shared/lib/session-state";
import { AuthListener } from "../components/AuthListener";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/**
 * Regression test for the sign-out 401 loop.
 *
 * Clearing the React Query cache does not stop a query — the next render
 * rebuilds the cache entry and refetches it unless `enabled` has already gone
 * false. So a teardown that cleared the cache while the token was still
 * readable refetched /users/me with no credential, got a 401, dispatched
 * `auth:unauthorized`, cleared the cache again, and never stopped.
 *
 * The two invariants below are what actually break the cycle. If either fails,
 * the loop is back.
 */

// A stand-in for the always-enabled hooks the seller layout mounts —
// useStoreProfiles, useOrgContext and friends.
function AlwaysEnabledQuery({
  name,
  requiresAuth,
}: {
  name: string;
  requiresAuth?: boolean;
}) {
  useSafeQuery({
    queryKey: [name],
    queryFn: () => fetcher(`/api/v1/${name}`),
    requiresAuth,
  });
  return null;
}

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

describe("sign-out teardown", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let unauthorizedHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    endSignOut();

    // Mirrors the API: no Authorization header -> 401 "No token provided".
    fetchMock = vi
      .fn()
      .mockImplementation((_url: string, init?: RequestInit) => {
        const headers = (init?.headers ?? {}) as Record<string, string>;
        const authorized = Boolean(headers.Authorization);
        return Promise.resolve({
          ok: authorized,
          status: authorized ? 200 : 401,
          headers: new Headers(),
          json: async () =>
            authorized ? { data: {} } : { message: "No token provided" },
        });
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    router.push.mockClear();
    router.replace.mockClear();

    unauthorizedHandler = vi.fn();
    window.addEventListener("auth:unauthorized", unauthorizedHandler);
  });

  afterEach(() => {
    window.removeEventListener("auth:unauthorized", unauthorizedHandler);
    vi.restoreAllMocks();
  });

  function makeClient() {
    return new QueryClient({
      queryCache: new QueryCache({
        // The same wiring query-provider.tsx installs.
        onError: (error) => {
          const result = routeError(error);
          if (result.action !== "logout") return;
          if (!claimSignOut()) return;
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        },
      }),
      defaultOptions: {
        queries: { retry: false, refetchOnMount: true },
      },
    });
  }

  it("terminates: an unguarded query stops after at most one tokenless round", async () => {
    setToken("valid-access-token", "valid-refresh-token");
    const queryClient = makeClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AlwaysEnabledQuery name="users/me" />
        <AlwaysEnabledQuery name="stores/my-stores" />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    fetchMock.mockClear();

    await act(async () => {
      clearAuthSession(() => clearToken(), queryClient);
    });
    await settle();

    // A query with no `requiresAuth` is still rebuilt by the render that follows
    // teardown, so one final tokenless round is expected — 24 of the 28
    // useSafeQuery call sites are in this position. What must not happen is a
    // second round: that is the loop.
    const afterFirstRound = fetchMock.mock.calls.length;
    expect(afterFirstRound).toBeLessThanOrEqual(2);

    await settle();
    await settle();

    // The invariant. Before the fix this climbed without bound.
    expect(fetchMock.mock.calls.length).toBe(afterFirstRound);
  });

  it("fires nothing at all when the query declares requiresAuth", async () => {
    setToken("valid-access-token", "valid-refresh-token");
    const queryClient = makeClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AlwaysEnabledQuery name="users/me" requiresAuth />
        <AlwaysEnabledQuery name="stores/my-stores" requiresAuth />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    fetchMock.mockClear();

    await act(async () => {
      clearAuthSession(() => clearToken(), queryClient);
    });
    await settle();
    await settle();

    // `enabled` goes false the moment the credential is published, so the
    // rebuilt cache entry is inert and not one request escapes.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("dispatches no auth:unauthorized event during an explicit sign-out", async () => {
    setToken("valid-access-token", "valid-refresh-token");
    const queryClient = makeClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AlwaysEnabledQuery name="users/me" />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    await act(async () => {
      clearAuthSession(() => clearToken(), queryClient);
    });
    await settle();

    // The user asked to leave; nothing should be reporting a dead session at
    // them. AuthListener reacting here is what re-entered the teardown.
    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it("still reports a genuine session death exactly once", async () => {
    // No token at all: the tab the middleware admitted on a shared cookie while
    // sessionStorage was empty. This must NOT be silent — it is the path a
    // `getToken()`-based guard would have swallowed.
    const queryClient = makeClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AlwaysEnabledQuery name="users/me" />
        <AlwaysEnabledQuery name="stores/my-stores" />
        <AlwaysEnabledQuery name="seller/org/context" />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(unauthorizedHandler).toHaveBeenCalled());
    await settle();

    // Three dead queries, one dead session, one event, one toast.
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  // The closed cycle, end to end. AuthListener is the edge that made the loop
  // infinite rather than merely wasteful: it answered a 401 by tearing the cache
  // down again, which re-armed the queries that produced the next 401, and it
  // re-issued a navigation each turn — every push aborting the previous RSC
  // fetch, which is why login?_rsc sat pending forever.
  describe("with AuthListener mounted (the full cycle)", () => {
    it("settles after an explicit sign-out: bounded requests, one navigation", async () => {
      setToken("valid-access-token", "valid-refresh-token");
      const queryClient = makeClient();

      render(
        <QueryClientProvider client={queryClient}>
          <AuthListener />
          <AlwaysEnabledQuery name="users/me" />
          <AlwaysEnabledQuery name="stores/my-stores" />
        </QueryClientProvider>,
      );

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      fetchMock.mockClear();

      await act(async () => {
        clearAuthSession(() => clearToken(), queryClient);
      });
      await settle();

      const afterFirstRound = fetchMock.mock.calls.length;
      await settle();
      await settle();

      expect(fetchMock.mock.calls.length).toBe(afterFirstRound);
      // The user initiated this; the layout's own handler routes them. Nothing
      // here should be reporting a dead session or racing that navigation.
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("settles after a genuine session death: one navigation, no re-entry", async () => {
      const queryClient = makeClient();

      render(
        <QueryClientProvider client={queryClient}>
          <AuthListener />
          <AlwaysEnabledQuery name="users/me" />
          <AlwaysEnabledQuery name="stores/my-stores" />
          <AlwaysEnabledQuery name="seller/org/context" />
        </QueryClientProvider>,
      );

      await waitFor(() => expect(router.replace).toHaveBeenCalled());
      const afterFirstRound = fetchMock.mock.calls.length;

      await settle();
      await settle();

      // Exactly one committed navigation. More than one means each was
      // aborting the last.
      expect(router.replace).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith("/login");
      expect(fetchMock.mock.calls.length).toBe(afterFirstRound);
    });
  });
});
