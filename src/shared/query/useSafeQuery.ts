import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { getRetryCount } from "@/shared/errors/retry-policy";
import { useAuthToken } from "@/shared/hooks/useAuthToken";

type UseSafeQueryOptions<
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "retry"> & {
  /**
   * Hold the query until a credential exists.
   *
   * Defence in depth for sign-out: a query whose `enabled` is unconditional
   * fires the instant the cache is cleared, and with no token it can only 401.
   *
   * Opt-in rather than default-deny. Plenty of queries here are genuinely
   * anonymous — categories, browse, reviews — and silently disabling those
   * renders an empty page with no error, which is the worst kind of regression
   * to track down. Set it on queries that only make sense behind a login.
   */
  requiresAuth?: boolean;
};

/**
 * Drop-in replacement for useQuery.
 * Automatically applies the FAOS retry policy — no per-component retry logic needed.
 */
export function useSafeQuery<
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
>({ requiresAuth, ...options }: UseSafeQueryOptions<TData, TError, TQueryKey>) {
  const token = useAuthToken();

  // The caller's own `enabled` still has the final say — this only ever narrows.
  // The function form has to be handled explicitly: v5 allows `enabled` to be a
  // predicate, and collapsing it to a boolean would quietly drop the condition.
  const enabled = !requiresAuth
    ? options.enabled
    : typeof options.enabled === "function"
      ? (query: Parameters<typeof options.enabled>[0]) =>
          !!token && (options.enabled as (q: typeof query) => boolean)(query)
      : !!token && (options.enabled ?? true);

  return useQuery({
    ...options,
    enabled,
    retry: (count, error) => count < getRetryCount(error),
  });
}
