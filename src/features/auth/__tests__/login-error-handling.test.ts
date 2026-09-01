import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, MutationCache } from "@tanstack/react-query";
import { ApiError } from "@/shared/errors/api-error";
import { routeError } from "@/shared/errors/error-router";

/**
 * Reproduces the global error path from `shared/lib/providers/query-provider.tsx`
 * around a real MutationCache, so the meta opt-out is exercised the way React Query
 * actually invokes it rather than by calling a handler directly.
 */
type ErrorHandlingMeta = { skipGlobalErrorHandling?: boolean };

function makeClient(onToast: (message: string) => void) {
  return new QueryClient({
    defaultOptions: { mutations: { retry: false } },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.meta as ErrorHandlingMeta | undefined;
        if (meta?.skipGlobalErrorHandling) return;

        const result = routeError(error);
        if (result.toast) onToast(result.toast);
        if (result.action === "logout") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      },
    }),
  });
}

const badCredentials = () =>
  Promise.reject(
    new ApiError("Incorrect email or password.", "AUTH", { status: 401 }),
  );

describe("global error handling for a failed login", () => {
  let unauthorized: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unauthorized = vi.fn();
    window.addEventListener("auth:unauthorized", unauthorized);
  });

  afterEach(() => {
    window.removeEventListener("auth:unauthorized", unauthorized);
  });

  /**
   * The reported bug: a wrong password is a 401, the global handler treated every 401
   * as "the session died", and so signed the user out and redirected to /login while
   * they were trying to log in — on top of the form's own error toast. Two toasts, the
   * first one false.
   */
  it("does not sign the user out when the login itself fails", async () => {
    const toasts: string[] = [];
    const client = makeClient((m) => toasts.push(m));

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: badCredentials,
        meta: { skipGlobalErrorHandling: true },
      })
      .execute(undefined)
      .catch(() => {});

    expect(unauthorized).not.toHaveBeenCalled();
    expect(toasts).toEqual([]);
  });

  it("still signs the user out when a normal call hits a dead session", async () => {
    // The opt-out must be scoped to the calls that ask for it, or a genuinely revoked
    // session would leave the user stranded on a page that cannot load.
    const toasts: string[] = [];
    const client = makeClient((m) => toasts.push(m));

    await client
      .getMutationCache()
      .build(client, { mutationFn: badCredentials })
      .execute(undefined)
      .catch(() => {});

    expect(unauthorized).toHaveBeenCalledTimes(1);
    expect(toasts).toEqual(["Incorrect email or password."]);
  });
});
