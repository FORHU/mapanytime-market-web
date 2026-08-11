"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { fetcher } from "@/shared/lib/http";

/** Roles the API's requireAdmin middleware accepts. Keep in sync with ADMIN_ROLES on the server. */
const ADMIN_ROLES = ["SUPER_ADMIN", "DEVELOPER", "ADMIN"];

interface MeResponse {
  data?: {
    id: string;
    roles?: { roleName: string }[];
  };
}

/**
 * Gates the admin console on the caller actually holding an admin role, not merely on being
 * signed in. This is a UX guard: the token lives in localStorage, so nothing the browser
 * reports here is trustworthy. Real enforcement is `requireAdmin` on the API — every admin
 * endpoint must keep its own check.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetcher<MeResponse>("/api/v1/users/me");
        const isAdmin = res?.data?.roles?.some((role) =>
          ADMIN_ROLES.includes(role.roleName),
        );

        if (cancelled) return;

        if (isAdmin) {
          setStatus("allowed");
        } else {
          router.replace("/");
        }
      } catch {
        // fetcher already redirects to /login on auth failures; anything else is treated as
        // "cannot prove admin", so fall back to the marketplace rather than rendering the console.
        if (!cancelled) router.replace("/");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  if (status !== "allowed") return null;

  return <>{children}</>;
}
