"use client";

import React, { useState, useEffect } from "react";
import { AdminAuthGate } from "@/features/auth/components/AdminAuthGate";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { AdminFooter } from "./_components/AdminFooter";

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
  const currentRole = "ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentRole={currentRole}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between flex-1">
          <div className="flex-1 space-y-8">{children}</div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
