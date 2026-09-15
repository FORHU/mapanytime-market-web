"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/shared/lib/token";
import { subscribeSessionChange } from "@/shared/lib/session-state";

/**
 * The access token, as reactive state.
 *
 * Lives in shared/ rather than reading useAuthStore because shared/ does not
 * import from features/ — and useSafeQuery, one of the callers, is shared code.
 *
 * Returns null on the first render on purpose. The token lives in
 * sessionStorage, which the server cannot see, so reporting it during the
 * initial client render would not match the server-rendered HTML. Callers get it
 * on the render after mount, the same one-tick delay the `mounted` flags in the
 * layout gates already pay.
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setToken(getToken());
    sync();
    return subscribeSessionChange(sync);
  }, []);

  return token;
}
