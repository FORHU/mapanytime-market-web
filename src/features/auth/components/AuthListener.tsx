"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
// ✅ FIXED: Relative route mapping straight to the unified store file inside the api folder
import { useAuthStore } from "../api/auth.api";

export function AuthListener() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear token and query cache on 401 interceptor drop
      setToken(null);
      queryClient.clear();
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, queryClient]);

  return null;
}
