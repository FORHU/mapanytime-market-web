"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";

export function AgentAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  // Gating on `mounted` alone let the console render for the frames between the
  // redirect being requested and the navigation completing — long enough for a
  // signed-out user to see real agent data after a back-button navigation.
  // `replace` above also keeps the dead page out of history, so Back cannot return
  // to it.
  if (!mounted || !token) return null;

  return <>{children}</>;
}
