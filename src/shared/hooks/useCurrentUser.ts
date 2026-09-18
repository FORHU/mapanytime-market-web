"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/shared/lib/token";
import { fetcher } from "@/shared/lib/http";

interface TokenClaims {
  userId: string | null;
  roles: string[];
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
    return {
      userId: claims.userId ?? null,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    };
  } catch {
    return null;
  }
}

/**
 * Reads the signed-in user's claims from the access token. Decoding happens in
 * an effect so the first server/client render always agree — read `isHydrated`
 * before branching on `userId`.
 */
export function useCurrentUser() {
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const decoded = token ? decodeToken(token) : null;
    setClaims(decoded);
    setIsHydrated(true);

    // Fallback: if token exists and has userId but roles is empty (e.g. token minted without roles claim),
    // fetch `/api/v1/users/me` to populate roles so navbars and role-gates never break.
    if (
      token &&
      decoded?.userId &&
      (!decoded.roles || decoded.roles.length === 0)
    ) {
      fetcher<{ data?: { roles?: Array<{ roleName: string } | string> } }>(
        "/api/v1/users/me",
      )
        .then((res) => {
          const rawRoles = res?.data?.roles;
          if (Array.isArray(rawRoles) && rawRoles.length > 0) {
            const roleNames = rawRoles.map((r) =>
              typeof r === "string" ? r : r.roleName,
            );
            setClaims((prev) =>
              prev
                ? { ...prev, roles: roleNames }
                : { userId: decoded.userId, roles: roleNames },
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  return {
    userId: claims?.userId ?? null,
    roles: claims?.roles ?? [],
    isHydrated,
  };
}
