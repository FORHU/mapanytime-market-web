"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AdminAuthGate } from "@/features/auth/components/AdminAuthGate";
import {
  LayoutDashboard,
  Store,
  Grid,
  Users,
  ShoppingBag,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  Bell,
  Search,
  ExternalLink,
  Key,
} from "lucide-react";

import Link from "next/link";

interface AdminNavChild {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

interface AdminNavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
  children?: AdminNavChild[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthGate>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Operations: true,
      Governance: true,
    },
  );

  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const currentRole = "ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const navItems: AdminNavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["ADMIN"],
    },
    {
      name: "Operations",
      icon: Store,
      roles: ["ADMIN"],
      children: [
        {
          name: "Store Approvals",
          href: "/admin/stores",
          icon: Store,
          badge: "3 Pending",
          roles: ["ADMIN"],
        },
        {
          name: "Categories",
          href: "/admin/categories",
          icon: Grid,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "Governance & RBAC",
      icon: Shield,
      roles: ["ADMIN"],
      children: [
        {
          name: "Users & Accounts",
          href: "/admin/users",
          icon: Users,
          roles: ["ADMIN"],
        },
        {
          name: "Permissions Matrix",
          href: "/admin/permissions",
          icon: Key,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "Order Oversight",
      href: "/admin/orders",
      icon: ShoppingBag,
      roles: ["ADMIN", "SUPPORT_AGENT"],
    },
  ];

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isRoleAllowed = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(currentRole);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#082f49] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider uppercase text-cyan-400">
            Loading Admin Console...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen bg-[var(--background-primary)] text-[var(--text-primary)] transition-colors duration-300 flex overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } h-screen max-h-screen transition-all duration-300 border-r border-[var(--border-default)] bg-[var(--background-secondary)]/70 backdrop-blur-xl flex flex-col justify-between z-30 relative overflow-hidden`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Branding */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-light)]">
            <div
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
              onClick={() => router.push("/admin")}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-white text-sm shadow-md">
                MA
              </div>
              {sidebarOpen && (
                <div className="flex flex-col text-left">
                  <span className="text-base font-black tracking-tight leading-none text-[var(--text-primary)]">
                    Map<span style={{ color: "var(--brand-core)" }}>Admin</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider mt-0.5">
                    Control Center
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--background-tertiary)] text-[var(--text-secondary)] transition-colors"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-300 ${
                  !sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Navigation Links with Child Directories & Role Filter */}
          <nav className="p-4 space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
            {navItems.map((item) => {
              if (!isRoleAllowed(item.roles)) return null;

              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isGroupExpanded = expandedGroups[item.name] ?? true;

              const isChildActive =
                hasChildren &&
                item.children?.some((child) => pathname === child.href);

              if (hasChildren) {
                const visibleChildren = (item.children || []).filter((child) =>
                  isRoleAllowed(child.roles),
                );
                if (visibleChildren.length === 0) return null;

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                        isChildActive
                          ? "text-[var(--brand-core)] bg-[var(--brand-core)]/10"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[var(--brand-core)] shrink-0" />
                        {sidebarOpen && <span>{item.name}</span>}
                      </div>
                      {sidebarOpen &&
                        (isGroupExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ))}
                    </button>

                    {isGroupExpanded && sidebarOpen && (
                      <div className="pl-6 space-y-1 border-l-2 border-[var(--border-light)] ml-4">
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon || Icon;
                          const isChildSelected = pathname === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              prefetch={true}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isChildSelected
                                  ? "bg-[var(--brand-core)] text-white shadow-sm"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                                {sidebarOpen && <span>{child.name}</span>}
                              </div>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
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

              const isSelected = pathname === item.href;

              return (
                <Link
                  key={item.href || item.name}
                  href={item.href || "#"}
                  prefetch={true}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                    isSelected
                      ? "bg-[var(--brand-core)] text-white shadow-md shadow-sky-500/20"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </div>
                  {item.badge && sidebarOpen && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-[var(--border-light)] space-y-2 shrink-0">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
            {sidebarOpen && <span>View Marketplace</span>}
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top App Bar */}
        <header className="h-20 border-b border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search stores, orders, users, categories..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] text-[var(--text-secondary)] transition-colors"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            <button className="relative p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] text-[var(--text-secondary)] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </button>

            <div className="h-6 w-px bg-[var(--border-light)] mx-1" />

            <div className="flex items-center gap-3 pl-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                AD
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Admin System
                </span>
                <span className="text-[10px] text-cyan-400 font-medium">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between flex-1">
          <div className="flex-1 space-y-8">{children}</div>

          <footer
            className="pt-12 pb-4 mt-auto border-t text-center text-[11px] text-zinc-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: "var(--border-light)" }}
          >
            <span>
              © 2026 MapAnytime Ecosystem — Super Admin Control Console
            </span>
            <span className="font-mono text-[10px] text-cyan-400">
              v1.1.0 · Super Admin Protocol
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
