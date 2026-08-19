"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SellerLayout } from "@/shared/components/layout/SellerLayout";
import { useAuthStore } from "../stores/auth.store";
import { useAuth } from "../hooks/useAuth";

export function SellerAuthGate({
  children,
  stores,
  storeSelector,
}: {
  children: React.ReactNode;
  stores?: any[];
  storeSelector?: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.replace("/login");
    }
  }, [mounted, router, token]);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 shrink-0 border-r border-[var(--border-light)] bg-[var(--background-secondary)] lg:block" />
        <div className="flex-1 p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-[var(--background-secondary)]" />
        </div>
      </div>
    );
  }

  return (
    <SellerLayout
      isAuthenticated={!!token}
      onSignOut={handleSignOut}
      stores={stores}
      storeSelector={storeSelector}
    >
      {children}
    </SellerLayout>
  );
}
