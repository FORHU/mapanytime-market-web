"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import {
  Menu,
  Sun,
  Moon,
  Lock,
  Unlock,
  Bell,
  ShoppingBag,
  Check,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { type Socket } from "socket.io-client";
import { acquireSocket, releaseSocket } from "@/shared/lib/socket";
import { toast } from "sonner";
import { getToken } from "@/shared/lib/token";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import type { ActiveStoreSummary } from "./Sidebar";

interface SellerLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onSignOut: () => void;
  /**
   * The seller's stores, supplied by the caller. Fetched in `SellerAuthGate`
   * rather than here: this component lives in the `shared/` kernel, which is
   * infrastructure and must not reach into `features/`. Only the shape is
   * declared here; where the data comes from is the caller's business.
   */
  stores?: ActiveStoreSummary[];
  /**
   * Store switcher, rendered in the header. Passed in for the same reason as
   * `stores` above — the widget lives in `features/`, so the kernel takes it as
   * a slot instead of importing it.
   */
  storeSelector?: React.ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function SellerLayout({
  children,
  isAuthenticated,
  onSignOut,
  stores,
  storeSelector,
}: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { userId, roles } = useCurrentUser();

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const activeStore = stores?.find((s) => s.id === activeStoreId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync the active seller context whenever the route changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedActiveId = localStorage.getItem("active_store_context_id");
      const storedPropertyId = localStorage.getItem(
        "active_property_context_id",
      );
      setActiveStoreId(storedActiveId);
      setActivePropertyId(storedPropertyId);
    }
  }, [pathname]);

  // Real-time Socket.io Notification Listener for Incoming Orders
  useEffect(() => {
    const token = getToken();
    if (!userId || !token) return;

    const socket: Socket = acquireSocket();

    const handleConnect = () => {
      socket.emit("subscribe_notifications", { userId });
    };

    // The shared socket may already be connected by another consumer, in which case no further
    // "connect" event is coming and the subscription has to be sent right away.
    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);

    const handleNotification = (data: any) => {
      const isOrder =
        data?.metadata?.type === "ORDER_CREATED" ||
        data?.metadata?.type === "ORDER_PAID" ||
        data?.type === "ORDER_CREATED";

      const title = isOrder
        ? "🛍️ New Order Received!"
        : "Notification Received";
      const message =
        data?.message ||
        `Order #${data?.metadata?.orderId?.slice(0, 8) || "LIVE"} placed by customer.`;

      toast.success(title, {
        description: message,
        duration: 6000,
      });

      const newItem: NotificationItem = {
        id: String(Date.now()),
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };

      setNotifications((prev) => [newItem, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNotification);

    return () => {
      // Remove by reference — the connection outlives this component now, so leaving handlers
      // attached would stack a duplicate toast per remount.
      socket.off("connect", handleConnect);
      socket.off("notification:new", handleNotification);
      releaseSocket();
    };
  }, [userId]);

  const handleClearContext = () => {
    localStorage.removeItem("active_store_context_id");
    localStorage.removeItem("active_property_context_id");
    setActiveStoreId(null);
    setActivePropertyId(null);
    router.push("/seller/manage-stores");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const hasSellerContext = Boolean(activeStoreId || activePropertyId);
  const isPropertyRoute = pathname.startsWith("/seller/properties/");
  const isPropertyContext = Boolean(
    (activePropertyId || isPropertyRoute) && !activeStoreId,
  );
  // Unlocking the layout so Global Seller Context works without redirecting
  const isLocked = mounted && !isAuthenticated;

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--background-primary)" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLocked={isLocked}
        isPropertyContext={isPropertyContext}
        propertyId={activePropertyId}
        activeStoreId={activeStoreId}
        activeStore={activeStore}
        onSignOut={onSignOut}
        onClearContext={handleClearContext}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header
          className="h-20 border-b flex items-center px-6 justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-80 transition-colors shrink-0"
          style={{
            backgroundColor: "var(--background-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border rounded-xl md:hidden transition-colors disabled:opacity-30"
              style={{
                backgroundColor: "var(--background-tertiary)",
                borderColor: "var(--border-light)",
              }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-left hidden sm:flex items-center gap-3">
              {storeSelector}
              <div className="border-l border-[var(--border-light)] pl-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  {activeStore?.storeName
                    ? `${activeStore.storeName} Overview`
                    : "All Stores Overview"}
                </h2>
                {activeStoreId ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Managing{" "}
                    {activeStore?.storeName || "store"}
                  </span>
                ) : activePropertyId || isPropertyRoute ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Managing your property
                  </span>
                ) : (
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> All Stores Combined
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {roles.includes("BUYER") && (
              <Button
                variant="secondary"
                onClick={() => router.push("/buyer")}
                className="!h-9 !px-3 !rounded-xl !text-xs !bg-indigo-50 !text-indigo-600 !border-indigo-100 hover:!bg-indigo-100 dark:!bg-indigo-950/40 dark:!text-indigo-400 dark:hover:!bg-indigo-900/40"
              >
                <User className="w-3.5 h-3.5 mr-1.5" /> Buyer Portal
              </Button>
            )}
            {roles.some((r: string) =>
              ["SUPER_ADMIN", "DEVELOPER", "ADMIN"].includes(r),
            ) && (
              <Button
                variant="secondary"
                onClick={() => router.push("/admin")}
                className="!h-9 !px-3 !rounded-xl !text-xs !bg-rose-50 !text-rose-600 !border-rose-100 hover:!bg-rose-100 dark:!bg-rose-950/40 dark:!text-rose-400 dark:hover:!bg-rose-900/40"
              >
                <User className="w-3.5 h-3.5 mr-1.5" /> Admin Console
              </Button>
            )}
            {roles.includes("SUPPORT_AGENT") && (
              <Button
                variant="secondary"
                onClick={() => router.push("/agent")}
                className="!h-9 !px-3 !rounded-xl !text-xs !bg-sky-50 !text-sky-600 !border-sky-100 hover:!bg-sky-100 dark:!bg-sky-950/40 dark:text-sky-400 dark:hover:bg-sky-900/40"
              >
                <User className="w-3.5 h-3.5 mr-1.5" /> Agent Portal
              </Button>
            )}

            {/* Notification Bell Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="w-9 h-9 border rounded-xl flex items-center justify-center relative hover:bg-[var(--background-tertiary)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
                aria-label="Order Notifications"
              >
                <Bell className="w-4 h-4 text-zinc-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-4 space-y-3 z-50 text-left bg-[var(--background-elevated)]"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center justify-between border-b pb-2 border-[var(--border-light)]">
                    <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-sky-500" /> Order
                      alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-[var(--text-secondary)] text-sm">
                        No new orders yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            !n.read
                              ? "bg-sky-500/10 border-sky-500/30 text-[var(--text-primary)]"
                              : "bg-[var(--background-secondary)] border-[var(--border-light)] text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-sm">
                            <span>{n.title}</span>
                            <span className="text-xs text-[var(--text-tertiary)] shrink-0 ml-2">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="!w-9 !h-9 !p-0 !rounded-xl border"
              style={{ borderColor: "var(--border-light)" }}
              aria-label="Toggle Theme"
            >
              {!mounted ? (
                <div className="w-4 h-4 rounded-full animate-pulse bg-[var(--border-strong)]" />
              ) : resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </Button>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div className="flex-1">
            {isLocked ? (
              <div className="p-12 text-center py-24">
                <p className="text-sm text-[var(--text-secondary)]">
                  Taking you to your store or property list…
                </p>
              </div>
            ) : (
              children
            )}
          </div>

          {/* <footer
            className="pt-12 pb-4 mt-auto border-t text-center text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: "var(--border-light)" }}
          >
            <span>© 2026 MapAnytime — Seller tools</span>
            <span className="font-mono text-xs">v1.1.0</span>
          </footer> */}
        </main>
      </div>
    </div>
  );
}
