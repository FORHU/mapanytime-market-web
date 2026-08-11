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

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            logError(error);
            const result = routeError(error);

            if (result.toast) {
              toast.error(result.toast);
            }

            if (result.action === "logout") {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            logError(error);
            const result = routeError(error);

            if (result.toast) {
              toast.error(result.toast);
            }

            if (result.action === "logout") {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
              }
            }
          },
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
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
