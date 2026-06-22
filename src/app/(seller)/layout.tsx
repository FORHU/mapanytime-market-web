"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exact ordered list extracted from your high-fidelity UI design
  const navigation = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Product Management", href: "/seller/products", icon: Package },
    { name: "AI Product Upload", href: "/seller/upload", icon: Sparkles },
    { name: "Orders", href: "/seller/orders", icon: ClipboardList },
    { name: "Inventory", href: "/seller/inventory", icon: Boxes },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Reviews", href: "/seller/reviews", icon: MessageSquare },
    { name: "Store Profile", href: "/seller/profile", icon: Store },
    { name: "Settings", href: "/seller/settings", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 flex font-sans antialiased">
      {/* Backdrop overlay for mobile viewport drawers */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── SIDEBAR NAVIGATION (Desktop & Mobile Overlay) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Title Area */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-xl tracking-tight text-emerald-600 flex items-center gap-1">
              Map<span className="text-slate-900">Anytime</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-fidelity Profile Badge Widget Component */}
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

        {/* Links Navigation Stack */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                  <span>{item.name}</span>
                </div>
                {/* Visual arrow indicating layout selection focus */}
                {isActive && <div className="w-1 h-2 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Profiles / Action buttons */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <Store className="w-4 h-4 text-slate-400" />
            Back to Home
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all text-left">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ACCELERATOR CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {/* Mobile Header Top Navbar (Hidden on Desktop viewports) */}
        <header className="h-20 px-6 border-b border-slate-200 bg-white flex items-center justify-between lg:hidden sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-black text-md text-emerald-600">
              MapAnytime
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Outer Content Injector Canvas */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
