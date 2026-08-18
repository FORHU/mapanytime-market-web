"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes";

export function AdminHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
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
  );
}
