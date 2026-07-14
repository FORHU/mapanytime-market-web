"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SellerLayout } from "@/shared/components/layout/SellerLayout";
import { useAuthStore } from "../stores/auth.store";
import { useAuth } from "../hooks/useAuth";

export function SellerAuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [router, token]);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <SellerLayout isAuthenticated={!!token} onSignOut={handleSignOut}>
      {children}
    </SellerLayout>
  );
}
