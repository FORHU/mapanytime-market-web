"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { clearAuthSession } from "../hooks/useAuth";

export function AuthListener() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Safe to tear down unconditionally: the dispatch sites are latched, so
      // this fires at most once per sign-out. Guarding on `getToken()` instead
      // would be wrong — http.ts clears storage before it dispatches, so on a
      // genuine session death the token is already gone here and the guard
      // would swallow the one event that needed handling.
      clearAuthSession(setToken, queryClient);

      // `replace`, not `push`: signing out should not leave the authenticated
      // page on the back stack. The pathname check is belt-and-braces now that
      // only one navigation can be issued per episode.
      if (!window.location.pathname.startsWith("/login")) {
        router.replace("/login");
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, queryClient]);

  return null;
}
