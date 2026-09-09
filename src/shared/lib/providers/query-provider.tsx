"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "sonner";
import { routeError } from "@/shared/errors/error-router";
import { getRetryCount } from "@/shared/errors/retry-policy";
import { logError } from "@/shared/errors/error-telemetry";

/**
 * Set `meta: { skipGlobalErrorHandling: true }` on a query or mutation whose failure is
 * an expected outcome it renders itself.
 *
 * Login is the motivating case: a wrong password is a 401, and the global handler below
 * treats every 401 as "the session died" — it toasted and dispatched `auth:unauthorized`,
 * which cleared the session and redirected to /login while the user was *trying to log
 * in*, on top of the form's own error toast. `shared/lib/http.ts` already exempts
 * `/auth/login` from the same redirect one layer down; this is that exemption at the
 * React Query layer.
 */
type ErrorHandlingMeta = { skipGlobalErrorHandling?: boolean };

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => {
    // Identical for queries and mutations; the two caches just hand it different
    // second arguments, so each call site passes the meta it has.
    const handleError = (error: unknown, meta?: ErrorHandlingMeta) => {
      logError(error);
      if (meta?.skipGlobalErrorHandling) return;

      const result = routeError(error);

      if (result.toast) {
        toast.error(result.toast);
      }

      if (result.action === "logout") {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
    };

    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) =>
          handleError(error, query.meta as ErrorHandlingMeta | undefined),
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) =>
          handleError(error, mutation.meta as ErrorHandlingMeta | undefined),
      }),
      defaultOptions: {
        queries: {
          // A 5s default made every query stale almost immediately, so each remount and each
          // window focus re-hit the API — enough, with the server's rate limit, to throttle
          // real sessions. 30s absorbs remount storms while still being short enough that a
          // user who comes back to the tab sees current data.
          staleTime: 1000 * 30,
          // Left on deliberately. This was briefly false globally to quieten the socket-backed
          // queries, but those now opt out individually via socketBackedQueryOptions —
          // switching focus-refetch off for the whole app to fix three hooks meant every other
          // screen silently served stale data with no way to refresh but a reload.
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          retry: (count, error) => count < getRetryCount(error),
        },
      },
    });
  });

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
