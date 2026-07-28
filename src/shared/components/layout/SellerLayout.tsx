"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import {
  Menu,
  Sun,
  Moon,
  Lock,
  Unlock,
  RefreshCw,
  Bell,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getToken } from "@/shared/lib/token";

interface SellerLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onSignOut: () => void;
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
}: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        setUserId(JSON.parse(jsonPayload).userId || null);
      } catch {}
    }
  }, []);

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync activeStoreId from localStorage whenever route/pathname changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedActiveId = localStorage.getItem("active_store_context_id");
      setActiveStoreId(storedActiveId);
    }
  }, [pathname]);

  // Real-time Socket.io Notification Listener for Incoming Orders
  useEffect(() => {
    const token = getToken();
    if (!userId || !token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_WS_GATEWAY_URL || "http://localhost:4002";
    const socket: Socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("subscribe_notifications", { userId });
    });

    socket.on("notification:new", (data: any) => {
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
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleClearContext = () => {
    localStorage.removeItem("active_store_context_id");
    setActiveStoreId(null);
    router.push("/seller/manage-stores");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const isLocked =
    mounted &&
    (!isAuthenticated ||
      (!activeStoreId && pathname !== "/seller/manage-stores"));

  useEffect(() => {
    if (
      mounted &&
      isAuthenticated &&
      !activeStoreId &&
      pathname !== "/seller/manage-stores"
    ) {
      router.push("/seller/manage-stores");
    }
  }, [router, activeStoreId, pathname, mounted, isAuthenticated]);

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--background-primary)" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLocked={!activeStoreId}
        onSignOut={onSignOut}
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
              <h2 className="text-sm font-black text-[var(--text-primary)]">
                Verified Merchant Dashboard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeStoreId && (
              <Button
                variant="dark"
                onClick={handleClearContext}
                className="!h-9 !px-4 !rounded-xl !text-[10px]"
              >
                <RefreshCw className="w-3 h-3" /> Switch Store
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
                    <span className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-sky-400" /> Order
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-sky-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-zinc-400 font-medium text-[11px]">
                        No incoming order alerts yet.
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
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-zinc-400">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
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
                <p className="text-sm text-zinc-400">
                  Rerouting environment securely into your store selection
                  frame...
                </p>
              </div>
            ) : (
              children
            )}
          </div>

          <footer
            className="pt-12 pb-4 mt-auto border-t text-center text-[11px] text-zinc-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: "var(--border-light)" }}
          >
            <span>
              © 2026 MapAnytime Ecosystem — Merchant Control Workspace
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              v1.1.0 · Context Isolated
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
