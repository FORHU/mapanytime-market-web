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
 * signed in. This is a UX guard: the token lives in sessionStorage, so nothing the browser
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

  // A skeleton, not `null`. This gate blocks on a network round-trip to
  // /users/me, so returning null meant the admin console was a blank white page
  // for the whole duration of that request — the slowest first paint in the app.
  // The check itself still gates the content; only the empty frame is gone.
  if (status !== "allowed") {
    return (
      <div className="p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--background-secondary)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-[var(--background-secondary)]"
            />
          ))}
        </div>
        <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-[var(--background-secondary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
