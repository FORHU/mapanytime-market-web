"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import Link from "next/link";
import { Map, ShoppingBag, User, LogOut, Coins } from "lucide-react";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();
  const { roles } = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token && pathname !== "/login") {
      router.replace("/login");
    }
  }, [mounted, router, token, pathname]);

  const isDualRole = roles.includes("BUYER") && roles.includes("SELLER");

  if (!mounted) return null;

  if (!token && pathname !== "/login") {
    return null;
  }

  // If on login page and not authenticated, just render children without the layout nav
  if (!token && pathname === "/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Top Navigation */}
      <header className="h-16 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between shrink-0">
        <Link
          href="/buyer"
          className="font-display text-lg md:text-xl font-bold flex items-center gap-2"
        >
          <span className="text-primary">Map</span>Anytime
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/buyer"
            className="flex items-center gap-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
          >
            <Map className="w-4 h-4" />
            <span className="hidden md:inline">Live Map</span>
          </Link>

          <Link
            href="/buyer/rewards"
            className="flex items-center gap-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span className="hidden md:inline">MapPoints</span>
          </Link>

          {roles.includes("SELLER") && (
            <Link
              href="/seller/manage-stores"
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-900"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Seller Dashboard</span>
            </Link>
          )}

          {roles.some((r: string) =>
            ["SUPER_ADMIN", "DEVELOPER", "ADMIN"].includes(r),
          ) && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors border border-rose-100 dark:border-rose-900"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Admin Console</span>
            </Link>
          )}

          {roles.includes("SUPPORT_AGENT") && (
            <Link
              href="/agent"
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:hover:bg-sky-900/40 transition-colors border border-sky-100 dark:border-sky-900"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Agent Portal</span>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-error hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">{children}</main>
    </div>
  );
}
