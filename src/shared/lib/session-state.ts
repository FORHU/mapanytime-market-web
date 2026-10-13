/**
 * Cross-cutting session signals: "the credential changed" and "a sign-out is
 * already in progress".
 *
 * Deliberately imports NOTHING. session.ts explains why: auth.store.ts imports
 * http.ts, so anything http.ts can reach must not reach back into features/auth.
 * A module with an empty import list is trivially safe to pull in from
 * shared/lib, shared/query, shared/hooks and features/auth alike. Keep it empty.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let signOutInFlight = false;

/**
 * Re-read the credential when it changes.
 *
 * Exists because a hook that reads the token once on mount cannot notice a
 * logout: useCurrentUser seeded its claims in a `useEffect(..., [])` and so kept
 * reporting a userId long after the token was gone, which left its /users/me
 * query enabled and refetching into a 401 forever.
 */
export function subscribeSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Published by token.ts on every write and clear, and nowhere else. */
export function publishSessionChange(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Single-flight sign-out latch. Returns true to exactly ONE caller per episode.
 *
 * A dead session fans out: three mounted queries 401 within the same tick, and
 * each one used to toast, dispatch `auth:unauthorized`, and tear the cache down
 * again — which re-armed the queries that produced the next round. Dispatch
 * sites use the return value to stay silent after the first; teardown callers
 * invoke it for the side effect and ignore the result.
 *
 * It must NEVER gate a query's `enabled`. Suppressing the reaction to a 401 is
 * the point; suppressing the requests themselves would strand a latched tab with
 * everything disabled and no way back.
 */
export function claimSignOut(): boolean {
  if (signOutInFlight) return false;
  signOutInFlight = true;
  return true;
}

export function isSigningOut(): boolean {
  return signOutInFlight;
}

/**
 * Released by token.ts when a new credential is written — an explicit sign-in, a
 * successful background refresh, or (implicitly) a page load, since module state
 * resets. Tying it to the credential rather than to a call site is what keeps a
 * latch from outliving the sign-out that set it.
 */
export function endSignOut(): void {
  signOutInFlight = false;
}
