"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  ShoppingBag,
  Home,
  Store,
  Users,
} from "lucide-react";

export function ThemeIcon({
  mounted,
  resolvedTheme,
}: {
  mounted: boolean;
  resolvedTheme?: string;
}) {
  if (mounted && resolvedTheme === "dark") return <Sun className="w-5 h-5" />;
  return <Moon className="w-5 h-5" />;
}

interface HomeNavBarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  toggleTheme: () => void;
  mounted: boolean;
  resolvedTheme?: string;
}

export default function HomeNavBar({
  activeSection,
  setActiveSection,
  toggleTheme,
  mounted,
  resolvedTheme,
}: HomeNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-outline-variant/10 docked full-width top-0 sticky z-50 transition-colors">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-gutter py-4 max-w-container-max mx-auto">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-headline-md font-bold text-on-surface flex items-center gap-2 group transition-colors"
        >
          <span className="text-primary group-hover:text-primary-fixed transition-colors">
            Map
          </span>
          Anytime
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-stack-md">
          <Link
            href="#map"
            onClick={() => setActiveSection("map")}
            className={`group flex items-center gap-2 transition-colors duration-200 ${activeSection === "map" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary pb-1 border-b-2 border-transparent"}`}
          >
            <ShoppingBag className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Shop
          </Link>
          <Link
            href="#real-estate"
            onClick={() => setActiveSection("real-estate")}
            className={`group flex items-center gap-2 transition-colors duration-200 ${activeSection === "real-estate" ? "text-secondary font-bold border-b-2 border-secondary pb-1" : "text-on-surface-variant hover:text-secondary pb-1 border-b-2 border-transparent"}`}
          >
            <Home className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
            Real Estate
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => setActiveSection("ecosystem")}
            className={`group flex items-center gap-2 transition-colors duration-200 ${activeSection === "ecosystem" ? "text-tertiary font-bold border-b-2 border-tertiary pb-1" : "text-on-surface-variant hover:text-tertiary pb-1 border-b-2 border-transparent"}`}
          >
            <Store className="w-4 h-4 text-tertiary group-hover:scale-110 transition-transform" />
            Sell
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => setActiveSection("ecosystem")}
            className={`group flex items-center gap-2 transition-colors duration-200 ${activeSection === "ecosystem" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary pb-1 border-b-2 border-transparent"}`}
          >
            <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Agents
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-stack-sm">
          <button
            onClick={toggleTheme}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"
            aria-label="Toggle dark mode"
          >
            <ThemeIcon mounted={mounted} resolvedTheme={resolvedTheme} />
          </button>
          <Link
            href="/admin"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"
            aria-label="Admin panel"
          >
            <ShieldCheck className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="font-display text-button-text text-on-surface hover:text-primary transition-colors px-4 py-2"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="font-display text-button-text bg-primary text-on-primary px-6 py-2 rounded-lg hover:bg-primary-fixed transition-all active:scale-95"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-on-surface p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-low border-b border-outline-variant/10 px-margin-mobile py-4 flex flex-col gap-4 shadow-lg">
          <Link
            href="#map"
            onClick={() => {
              setActiveSection("map");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 ${activeSection === "map" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            Shop
          </Link>
          <Link
            href="#real-estate"
            onClick={() => {
              setActiveSection("real-estate");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 ${activeSection === "real-estate" ? "text-secondary font-bold" : "text-on-surface-variant"}`}
          >
            <Home className="w-4 h-4 text-secondary" />
            Real Estate
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => {
              setActiveSection("ecosystem");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 ${activeSection === "ecosystem" ? "text-tertiary font-bold" : "text-on-surface-variant"}`}
          >
            <Store className="w-4 h-4 text-tertiary" />
            Sell
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => {
              setActiveSection("ecosystem");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 ${activeSection === "ecosystem" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            <Users className="w-4 h-4 text-primary" />
            Agents
          </Link>
          <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-on-surface-variant"
              >
                <ThemeIcon mounted={mounted} resolvedTheme={resolvedTheme} />
                Toggle Theme
              </button>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-on-surface-variant"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Console
              </Link>
            </div>
            <Link
              href="/login"
              className="font-display text-button-text text-on-surface py-2 border border-outline-variant/30 rounded-lg text-center"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="font-display text-button-text bg-primary text-on-primary py-2 rounded-lg text-center"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
