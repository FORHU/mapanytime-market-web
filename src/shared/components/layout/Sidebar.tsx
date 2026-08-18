"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  ShoppingBag,
  BarChart3,
  Store,
  Settings,
  LogOut,
  X,
  Lock,
  Boxes,
  Megaphone,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  House,
} from "lucide-react";
import { clearToken } from "@/shared/lib/token";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

/**
 * The shape this component needs from a store — declared structurally rather
 * than imported from `features/stores`, because `shared/` is infrastructure and
 * must not depend on a feature. The caller supplies something matching it.
 */
export interface ActiveStoreSummary {
  id: string;
  storeName: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked?: boolean;
  isPropertyContext?: boolean;
  propertyId?: string | null;
  activeStoreId?: string | null;
  /**
   * Resolved store for `activeStoreId`, passed in by the layout. Undefined
   * means "no store selected, or the id no longer resolves" — the same
   * distinction the previous in-component lookup made.
   */
  activeStore?: ActiveStoreSummary | null;
  onSignOut?: () => void;
  onClearContext?: () => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  roles?: string[];
  badge?: string;
  children?: NavItem[];
  requiresStore?: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  isLocked = false,
  isPropertyContext = false,
  propertyId,
  activeStoreId,
  activeStore,
  onSignOut,
  onClearContext,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      "Products & stock": true,
      Sales: true,
      "Store settings": true,
    },
  );

  const { roles } = useCurrentUser();

  const toggleGroup = (groupLabel: string) => {
    if (isLocked) return;
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  const navLinks: NavItem[] = [
    {
      label: "Dashboard",
      href: "/seller/dashboard",
      icon: LayoutDashboard,
      roles: ["SELLER", "ADMIN"],
    },
    {
      label: "Products & stock",
      icon: Package,
      roles: ["SELLER", "ADMIN"],
      children: [
        {
          label: "My products",
          href: "/seller/products",
          icon: Package,
          roles: ["SELLER", "ADMIN"],
        },
        {
          label: "Import products",
          href: "/seller/ai-upload",
          icon: Sparkles,
          roles: ["SELLER", "ADMIN"],
          badge: "AI",
          requiresStore: true,
        },
        {
          label: "Stock levels",
          href: "/seller/inventory",
          icon: Boxes,
          roles: ["SELLER", "ADMIN"],
          badge: "Soon",
          requiresStore: true,
        },
      ],
    },
    {
      label: "Sales",
      icon: ShoppingBag,
      roles: ["SELLER", "ADMIN"],
      children: [
        {
          label: "Orders",
          href: "/seller/orders",
          icon: ShoppingBag,
          roles: ["SELLER", "ADMIN"],
        },
        {
          label: "Promotions & ads",
          href: "/seller/promotions",
          icon: Megaphone,
          roles: ["SELLER", "ADMIN"],
        },
        {
          label: "Sales reports",
          href: "/seller/analytics",
          icon: BarChart3,
          roles: ["SELLER", "ADMIN"],
          badge: "Soon",
        },
        {
          label: "Customer reviews",
          href: "/seller/reviews",
          icon: MessageSquare,
          roles: ["SELLER", "ADMIN"],
          badge: "Soon",
        },
      ],
    },
    {
      label: "Store settings",
      icon: Settings,
      roles: ["SELLER", "ADMIN"],
      requiresStore: true,
      children: [
        {
          label: "Store profile",
          href: "/seller/store-profile/view",
          icon: Store,
          roles: ["SELLER", "ADMIN"],
        },
        {
          label: "Preferences",
          href: "/seller/settings",
          icon: Settings,
          roles: ["SELLER", "ADMIN"],
        },
      ],
    },
  ];

  const propertyNavLinks: NavItem[] = [
    {
      label: "Dashboard",
      href: `/seller/properties/${propertyId}/dashboard`,
      icon: LayoutDashboard,
      roles: ["SELLER", "ADMIN"],
    },
    {
      label: "Property",
      href: propertyId
        ? "/seller/properties/products"
        : "/seller/manage-stores",
      icon: House,
      roles: ["SELLER", "ADMIN"],
    },
  ];

  const isRoleAllowed = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    return roles.some((r) => allowedRoles.includes(r));
  };

  const filteredLinks = (
    isPropertyContext ? propertyNavLinks : navLinks
  ).filter((item) => isRoleAllowed(item.roles));

  const handleSignOutClick = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      clearToken();
      // Was `localStorage.clear()`, which also wiped the saved theme and any
      // in-progress onboarding drafts. Only the seller context belongs to the
      // session; clearToken() already handles the credentials themselves.
      localStorage.removeItem("active_store_context_id");
      localStorage.removeItem("active_property_context_id");
      router.push("/login");
    }
  };

  const linkBaseClasses =
    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none cursor-pointer";

  const badgeClasses = (badge: string) =>
    badge === "Soon"
      ? "px-1.5 py-0.5 rounded-full text-xs font-medium bg-[var(--background-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-light)]"
      : "px-1.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30";

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen max-h-screen w-64 border-r flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out md:translate-x-0 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--background-elevated)",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="flex flex-col flex-1 min-h-0 space-y-6">
          {/* Header Branding */}
          <div className="flex items-center justify-between shrink-0">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => !isLocked && router.push("/")}
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-core)] flex items-center justify-center text-white font-black text-sm shadow-md">
                MA
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-semibold tracking-tight leading-none text-[var(--text-primary)]">
                  Map<span style={{ color: "var(--brand-core)" }}>Anytime</span>
                </span>
                <span className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Seller tools
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
          </div>

          <div className="px-1 shrink-0">
            <Link
              href="/seller/manage-stores"
              onClick={onClose}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)] border border-[var(--border-light)] transition-colors group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--brand-core)] transition-colors shadow-sm">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {activeStore?.storeName || "All Stores"}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                    {activeStore ? "Switch Store" : "Manage store"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--brand-core)] transition-colors" />
            </Link>

            {activeStore && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onClearContext) onClearContext();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Deselect Store
              </button>
            )}
          </div>

          <div className="h-px w-full bg-[var(--border-light)] shrink-0" />

          {/* Navigation Items Scroll Container */}
          <nav className="flex-1 min-h-0 overflow-y-auto space-y-1.5 text-left pr-1 scrollbar-thin">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isGroupExpanded = isLocked
                ? false
                : (expandedGroups[item.label] ?? true);
              const isItemLocked =
                (isLocked && item.href !== "/seller/manage-stores") ||
                (item.requiresStore && !activeStore);

              const isChildActive =
                hasChildren &&
                item.children?.some((child) => pathname === child.href);

              if (hasChildren) {
                const visibleChildren = (item.children || []).filter((child) =>
                  isRoleAllowed(child.roles),
                );
                if (visibleChildren.length === 0) return null;

                if (isItemLocked) {
                  return (
                    <div key={item.label} className="space-y-1">
                      <div
                        className={`${linkBaseClasses} text-zinc-400 opacity-40 cursor-not-allowed justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-zinc-400" />
                          <span>{item.label}</span>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.label} className="space-y-1">
                    {/* Parent Directory Header */}
                    <div
                      onClick={() => toggleGroup(item.label)}
                      className={`${linkBaseClasses} justify-between text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]/60 ${
                        isChildActive
                          ? "text-[var(--brand-core)] bg-[var(--brand-core)]/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[var(--brand-core)]" />
                        <span>{item.label}</span>
                      </div>
                      {isGroupExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Child Route Links */}
                    {isGroupExpanded && (
                      <div className="pl-6 space-y-1 border-l-2 border-[var(--border-light)] ml-4">
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon || Icon;
                          const isChildSelected = pathname === child.href;
                          const isChildLocked =
                            (isLocked &&
                              child.href !== "/seller/manage-stores") ||
                            (child.requiresStore && !activeStore);

                          if (isChildLocked) {
                            return (
                              <div
                                key={child.label}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-zinc-400 opacity-40 cursor-not-allowed`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <ChildIcon className="w-4 h-4" />
                                  <span>{child.label}</span>
                                </div>
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={child.href}
                              href={child.href || "#"}
                              prefetch={true}
                              onClick={onClose}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                isChildSelected
                                  ? "bg-[var(--brand-core)] text-white shadow-sm"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ChildIcon className="w-4 h-4" />
                                <span>{child.label}</span>
                              </div>
                              {child.badge && (
                                <span className={badgeClasses(child.badge)}>
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href;

              if (isItemLocked) {
                return (
                  <div
                    key={item.label}
                    className={`${linkBaseClasses} text-zinc-400 opacity-40 cursor-not-allowed justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href || item.label}
                  href={item.href || "#"}
                  prefetch={true}
                  onClick={onClose}
                  className={`${linkBaseClasses} justify-between ${
                    isActive
                      ? "bg-[var(--brand-core)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={badgeClasses(item.badge)}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions — Fixed at Bottom */}
        <div className="shrink-0 pt-4 border-t border-[var(--border-light)] mt-2">
          <div
            onClick={handleSignOutClick}
            className={`${linkBaseClasses} text-rose-400 hover:bg-rose-500/10`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </div>
        </div>
      </aside>
    </>
  );
}
