/**
 * Shared React Query option fragments.
 *
 * These exist so aggressive caching stays attached to the queries that actually need it. The
 * settings below were briefly applied as *global* defaults to stop a handful of chatty,
 * socket-backed queries from tripping the server's rate limit — but that also switched off
 * focus-refetching for every other query in the app, so unrelated screens could sit on
 * minute-old data with no way to refresh short of a reload.
 */

/**
 * For queries whose data is pushed by the socket rather than polled.
 *
 * A window-focus refetch is pure overhead here: if the socket is connected the cache is already
 * current, and if it isn't, the hook's own invalidation on reconnect is what recovers — not a
 * focus event. Pair this with an explicit `staleTime` at the call site, since how long the data
 * stays good is a per-query question.
 */
export const socketBackedQueryOptions = {
  refetchOnWindowFocus: false,
} as const;
