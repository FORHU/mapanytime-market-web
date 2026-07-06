"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Sun, Moon, Lock, Unlock, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 🔒 Multi-Tenant Environment Session Locks
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Synced with localStorage context to keep state intact on reload
    const storedActiveId = localStorage.getItem("active_store_context_id");
    setActiveStoreId(storedActiveId);
  }, []);

  const handleClearContext = () => {
    localStorage.removeItem("active_store_context_id");
    setActiveStoreId(null);
    router.push("/seller/manage-stores");
  };

  // Determine if features should be totally locked down
  const isLocked = !activeStoreId && pathname !== "/seller/manage-stores";

  // Enforce lock redirect instantly
  useEffect(() => {
    if (mounted && !activeStoreId && pathname !== "/seller/manage-stores") {
      router.push("/seller/manage-stores");
    }
  }, [router, activeStoreId, pathname, mounted]);

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--background-primary)" }}
    >
      {/* Navigation Sidebar Frame - Pass down the lock state */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLocked={!activeStoreId}
      />

      {/* Main Viewport Content Stack */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-20 border-b flex items-center px-6 justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-80 transition-colors"
          style={{
            backgroundColor: "var(--background-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          {/* Left Block: Mobile Menu Hamburger Trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              disabled={!activeStoreId}
              className="p-2 border rounded-xl md:hidden transition-colors disabled:opacity-30"
              style={{
                backgroundColor: "var(--background-tertiary)",
                borderColor: "var(--border-light)",
              }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                MapAnytime Ecosystem
                {activeStoreId ? (
                  <span className="text-emerald-500 font-extrabold flex items-center gap-0.5 normal-case text-[10px]">
                    <Unlock className="w-2.5 h-2.5" /> Context Isolated
                  </span>
                ) : (
                  <span className="text-rose-500 font-extrabold flex items-center gap-0.5 normal-case text-[10px]">
                    <Lock className="w-2.5 h-2.5" /> Workspace Locked
                  </span>
                )}
              </span>
              <h2 className="text-sm font-black text-text-primary">
                Verified Merchant Dashboard
              </h2>
            </div>
          </div>

          {/* Right Block: Theme Toggle and Profile Widgets */}
          <div className="flex items-center gap-3">
            {activeStoreId && (
              <button
                onClick={handleClearContext}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
                style={{ borderColor: "var(--border-light)" }}
              >
                <RefreshCw className="w-3 h-3" /> Switch Store
              </button>
            )}

            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2.5 rounded-xl border transition-colors flex items-center justify-center w-9 h-9"
              style={{
                backgroundColor: "var(--background-tertiary)",
                borderColor: "var(--border-light)",
              }}
              aria-label="Toggle Theme"
            >
              {!mounted ? (
                <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              ) : resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            <div
              className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 border"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>
        </header>

        {/* Dynamic Inner Page Screen Render Slot */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto overflow-y-auto">
          {isLocked ? (
            <div className="p-12 text-center py-24">
              <p className="text-sm text-zinc-400">
                Rerouting environment securely into your store selection
                frame...
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
