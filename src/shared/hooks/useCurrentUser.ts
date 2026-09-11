"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/shared/lib/token";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { fetcher } from "@/shared/lib/http";

interface TokenClaims {
  userId: string | null;
}

interface MeResponse {
  data?: {
    id: string;
    roles?: { roleName: string }[];
  };
}

function decodeToken(token: string): TokenClaims | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const claims = JSON.parse(jsonPayload);
    return { userId: claims.userId ?? null };
  } catch {
    return null;
  }
}

/**
 * Reads the signed-in user's identity from the access token and their roles from
 * the API.
 *
 * `userId` comes from the token and is available as soon as `isHydrated` is true.
 * Roles do NOT: the access token deliberately carries no `roles` claim
 * (mapanytime-api F105 — a claim nobody verifies is only an invitation to start
 * trusting it), so they are fetched from `/users/me`, which resolves them from
 * the database on every call.
 *
 * That split is the thing to keep in mind when using this hook:
 *
 *  - `isHydrated` means "the token has been read", nothing more. Gate `userId`
 *    on it, as the seller pages do. It deliberately does NOT wait on the roles
 *    request — making it do so would delay every page that only needs `userId`.
 *  - `roles` is asynchronous. Branch on `rolesStatus`, never on `roles.length`:
 *    an empty array is indistinguishable from a pending or failed request, and
 *    treating "not known yet" as "holds nothing" is what blanked the seller
 *    sidebar when the claim was removed.
 */
export function useCurrentUser() {
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getToken();
    setClaims(token ? decodeToken(token) : null);
    setIsHydrated(true);
  }, []);

  const userId = claims?.userId ?? null;

  const rolesQuery = useSafeQuery<string[], Error>({
    queryKey: ["current-user", "roles", userId],
    queryFn: async () => {
      const res = await fetcher<MeResponse>("/api/v1/users/me");
      return res?.data?.roles?.map((role) => role.roleName) ?? [];
    },
    // Anonymous visitors hit the landing page, which reads this hook. Without
    // this guard every one of those visits fires a request that can only 401.
    enabled: !!userId,
    // Roles change on the order of never. One fetch per session is the point —
    // the shared query key is what keeps the nine call sites to a single request.
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Three states, not two, for the same reason `SellerAccessSummary.status`
   * carries them: "still loading" and "the request failed" both produce an empty
   * `roles`, and a caller that cannot tell them from a real empty list will
   * render a nav with nothing in it.
   *
   * Before hydration this is "pending", not "ready": `userId` is still null then,
   * and reporting a confident "no roles" for that first render is exactly the
   * flash of empty sidebar this hook exists to avoid. Once hydrated, a caller
   * with no `userId` is genuinely signed out — nothing to wait for, so "ready"
   * with no roles rather than pending forever.
   */
  const rolesStatus: "pending" | "error" | "ready" = !isHydrated
    ? "pending"
    : !userId
      ? "ready"
      : rolesQuery.isPending
        ? "pending"
        : rolesQuery.isError
          ? "error"
          : "ready";

  return {
    userId,
    roles: rolesQuery.data ?? [],
    rolesStatus,
    isHydrated,
  };
}
