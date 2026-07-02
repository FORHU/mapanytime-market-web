// src/app/(seller)/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  ClipboardList,
  Boxes,
  BarChart3,
  MessageSquare,
  Store,
  Settings2,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const storeId = params.storeId;
  const hasValidStoreId = typeof storeId === "string" && storeId.trim() !== "";

  // Dedicated function to talk to your backend signout endpoint
  const handleSignOut = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Clear layout and forward to the primary root landing page securely
      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorText = await response
          .text()
          .catch(() => "Unknown Server Error");
        console.error(
          `Logout API responded with status ${response.status}: ${errorText}`,
        );

        // Fallback: If your API fails or isn't built yet, still force redirect to landing page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Network error during backend signout:", error);
      // Fallback redirect on network failure
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    {
      name: "Manage Stores",
      href: "/seller/store",
      icon: Store,
      requiresStore: false,
    },
    {
      name: "Dashboard",
      subPath: "/dashboard",
      icon: LayoutDashboard,
      requiresStore: true,
    },

    {
      name: "Product Management",
      subPath: "/products",
      icon: Package,
      requiresStore: true,
    },
    {
      name: "AI Product Upload",
      subPath: "/upload",
      icon: Sparkles,
      requiresStore: true,
    },
    {
      name: "Orders",
      subPath: "/orders",
      icon: ClipboardList,
      requiresStore: true,
    },
    {
      name: "Inventory",
      subPath: "/inventory",
      icon: Boxes,
      requiresStore: true,
    },
    {
      name: "Checkout",
      subPath: "/checkout",
      icon: ShoppingCart,
      requiresStore: true,
    },
    {
      name: "Analytics",
      subPath: "/analytics",
      icon: BarChart3,
      requiresStore: true,
    },
    {
      name: "Reviews",
      subPath: "/reviews",
      icon: MessageSquare,
      requiresStore: true,
    },
    {
      name: "Store Profile",
      subPath: "/profile",
      icon: Store,
      requiresStore: true,
    },
    {
      name: "Settings",
      subPath: "/settings",
      icon: Settings2,
      requiresStore: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 flex font-sans antialiased">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-xl tracking-tight text-emerald-600 flex items-center gap-1">
              Map<span className="text-slate-900">Anytime</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
            suppressHydrationWarning
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 mx-3 my-4 rounded-xl bg-amber-50/60 border border-amber-100/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-sm text-white shadow-xs">
            SE
          </div>
          <div className="truncate">
            <h4 className="text-xs font-black text-slate-800 leading-none">
              Seller Account
            </h4>
            <span className="text-[10px] font-bold text-amber-700 inline-flex items-center gap-0.5 mt-1">
              Verified{" "}
              <CheckCircle2 className="w-2.5 h-2.5 text-amber-600 fill-amber-600/10" />
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const targetHref = item.requiresStore
              ? hasValidStoreId
                ? `/seller/store/${storeId}${item.subPath}`
                : "/seller/store"
              : item.href || "/seller/store";

            const isActive = item.requiresStore
              ? hasValidStoreId &&
                (pathname === targetHref ||
                  pathname.startsWith(targetHref + "/"))
              : pathname === targetHref;

            return (
              <Link
                key={item.name}
                href={targetHref}
                onClick={(e) => {
                  if (item.requiresStore && !hasValidStoreId) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs"
                    : item.requiresStore && !hasValidStoreId
                      ? "text-slate-300 cursor-not-allowed bg-transparent"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
                suppressHydrationWarning
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : item.requiresStore && !hasValidStoreId
                          ? "text-slate-200"
                          : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {isActive && <div className="w-1 h-2 rounded-full bg-white" />}
                {item.requiresStore && !hasValidStoreId && (
                  <Lock className="w-3 h-3 text-slate-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── FOOTER BACKEND ACTIONS ── */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            href="/seller/store"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <Store className="w-4 h-4 text-slate-400" />
            Back to Manage Store
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all text-left ${
              isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
            }`}
            suppressHydrationWarning
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ACCELERATOR CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <header className="h-20 px-6 border-b border-slate-200 bg-white flex items-center justify-between lg:hidden sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-black text-md text-emerald-600">
              MapAnytime
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
            suppressHydrationWarning
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
