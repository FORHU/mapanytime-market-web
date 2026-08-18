"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, Sun, Moon } from "lucide-react";

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
            href="#home"
            onClick={() => setActiveSection("home")}
            className={`${activeSection === "home" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}`}
          >
            Home
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setActiveSection("how-it-works")}
            className={`${activeSection === "how-it-works" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}`}
          >
            Your Market Journey
          </Link>
          <Link
            href="#map"
            onClick={() => setActiveSection("map")}
            className={`${activeSection === "map" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}`}
          >
            Discover. Shop. Sell.
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => setActiveSection("ecosystem")}
            className={`${activeSection === "ecosystem" ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}`}
          >
            Merchant Ecosystem
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
            href="#home"
            onClick={() => {
              setActiveSection("home");
              setMobileMenuOpen(false);
            }}
            className={`${activeSection === "home" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            Home
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => {
              setActiveSection("how-it-works");
              setMobileMenuOpen(false);
            }}
            className={`${activeSection === "how-it-works" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            Your Market Journey
          </Link>
          <Link
            href="#map"
            onClick={() => {
              setActiveSection("map");
              setMobileMenuOpen(false);
            }}
            className={`${activeSection === "map" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            Discover. Shop. Sell.
          </Link>
          <Link
            href="#ecosystem"
            onClick={() => {
              setActiveSection("ecosystem");
              setMobileMenuOpen(false);
            }}
            className={`${activeSection === "ecosystem" ? "text-primary font-bold" : "text-on-surface-variant"}`}
          >
            Merchant Ecosystem
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
