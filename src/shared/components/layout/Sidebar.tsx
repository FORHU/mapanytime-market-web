"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Settings,
  LogOut,
  X,
  Wand2,
  Package,
  LineChart,
  MessageSquare,
  Box,
  Lock,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked?: boolean; // 🔒 Added fallback state descriptor property
}

export function Sidebar({ isOpen, onClose, isLocked = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigationLinks = [
    { label: "Manage Stores", href: "/seller/manage-stores", icon: Store }, // 🌟 Exposed root context gateway item
    { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "AI Catalog Upload", href: "/seller/ai-upload", icon: Wand2 },
    { label: "My Products", href: "/seller/products", icon: Package },
    { label: "Inventory Stock", href: "/seller/inventory", icon: Box },
    { label: "Orders Stream", href: "/seller/orders", icon: ShoppingBag },
    { label: "Analytics Matrix", href: "/seller/analytics", icon: LineChart },
    { label: "Store Reviews", href: "/seller/reviews", icon: MessageSquare },
    { label: "Store Profile", href: "/seller/store-profile", icon: Store },
    { label: "System Settings", href: "/seller/settings", icon: Settings },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose(); // Auto-close drawer overlay on mobile view selection
  };

  const linkBaseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 select-none";

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Primary Sidebar Container Element */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--background-elevated)",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="space-y-8">
          {/* Header Identity Layout */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => !isLocked && router.push("/")}
            >
              <span className="text-xl font-black tracking-tight">
                Map<span style={{ color: "var(--brand-core)" }}>Central</span>
              </span>
            </div>
            {/* Close trigger for mobile screens */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links Loop Matrix */}
          <nav className="space-y-1 text-left">
            {navigationLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // 🔒 Prevent selection leakage: Lock down everything except store management selector
              const isItemLocked =
                isLocked && item.href !== "/seller/manage-stores";

              if (isItemLocked) {
                return (
                  <div
                    key={item.href}
                    className={`${linkBaseClasses} text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-40`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    <Lock className="w-3 h-3 text-zinc-400" />
                  </div>
                );
              }

              return (
                <div
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`${linkBaseClasses} cursor-pointer ${
                    isActive
                      ? "text-white shadow-sm"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? "var(--brand-core)"
                      : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                  }}
                >
                  <Icon className="w-4 h-4 dynamic-icon" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions (Sign Out Option Slot) */}
        <div
          className="pt-4 border-t"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div
            onClick={() => handleNavigation("/logout")}
            className={`${linkBaseClasses} cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}
