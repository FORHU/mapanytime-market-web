// src/app/page.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Camera,
  ShoppingBag,
  Search,
  ChevronRight,
  Sun,
  Moon,
  Users,
  Shield,
  Heart,
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [activeCatalogFilter, setActiveCatalogFilter] = useState("All Items");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  if (!mounted) {
    return (
      <div
        className="min-h-screen w-full transition-colors duration-300"
        style={{ backgroundColor: "var(--background-primary)" }}
      />
    );
  }

  const products = [
    {
      id: 1,
      name: "All New Rush",
      price: "$72.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 2,
      name: "All New Rush",
      price: "$54.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 3,
      name: "All New Rush",
      price: "$38.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 4,
      name: "All New Rush",
      price: "$91.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 5,
      name: "All New Rush",
      price: "$45.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 6,
      name: "All New Rush",
      price: "$67.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 7,
      name: "All New Rush",
      price: "$29.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
    {
      id: 8,
      name: "All New Rush",
      price: "$82.00 / day",
      img: "/placeholders/product-placeholder.png",
    },
  ];

  const stylePrimaryBg = {
    backgroundColor: "var(--background-primary)",
    color: "var(--text-primary)",
  };
  const styleSecondaryBg = { backgroundColor: "var(--background-secondary)" };
  const styleTertiaryBg = { backgroundColor: "var(--background-tertiary)" };
  const styleElevatedBg = { backgroundColor: "var(--background-elevated)" };
  const styleDefaultBorder = { borderColor: "var(--border-default)" };
  const styleLightBorder = { borderColor: "var(--border-light)" };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={stylePrimaryBg}
    >
      {/* ─── NAVIGATION HEADER ─── */}
      <nav
        className="border-b bg-opacity-80 backdrop-blur-md sticky top-0 z-50 transition-colors h-20 flex items-center"
        style={{ ...styleElevatedBg, ...styleDefaultBorder }}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <span
                className="text-2xl font-black tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Map<span style={{ color: "var(--brand-core)" }}>Anytime</span>
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
              <a
                href="#"
                className="transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                How It Works
              </a>
              <a
                href="#live-catalog"
                className="transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Live Map Feed
              </a>
              <a
                href="#ecosystem"
                className="transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Merchant Ecosystem
              </a>
              <a
                href="#testimonials"
                className="transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Testimonials
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border transition-colors"
              style={{ ...styleTertiaryBg, ...styleDefaultBorder }}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
            <button
              onClick={() => router.push("/register")}
              className="text-sm font-bold px-3 hidden sm:block transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Register
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--background-primary)",
              }}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--brand-core)" }}
            >
              Shop the map, anytime, anywhere.
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight transition-colors">
              Connecting{" "}
              <span style={{ color: "var(--brand-core)" }}>450M</span> Offline
              Stores to the World Through a Map, a Photo, and a Pickup.
            </h1>
            <p
              className="text-lg font-medium max-w-xl leading-relaxed transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover hyperlocal products from neighborhood stores, markets,
              and pop-ups — pinned live on a map near you.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                className="px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg"
                style={{ backgroundColor: "var(--brand-core)" }}
              >
                Explore Live Map
              </button>
              <button
                className="px-8 py-4 rounded-xl font-bold border transition-colors"
                style={{
                  ...styleSecondaryBg,
                  ...styleDefaultBorder,
                  color: "var(--text-primary)",
                }}
              >
                How to Sell
              </button>
            </div>

            <div
              className="grid grid-cols-3 gap-6 pt-10 border-t transition-colors"
              style={styleLightBorder}
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black transition-colors">
                  450M+
                </p>
                <p
                  className="text-xs font-medium uppercase mt-0.5 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Offline Stores
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black transition-colors">
                  180+
                </p>
                <p
                  className="text-xs font-medium uppercase mt-0.5 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Cities
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black transition-colors">
                  2.4M
                </p>
                <p
                  className="text-xs font-medium uppercase mt-0.5 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Daily Pickups
                </p>
              </div>
            </div>
          </div>

          {/* Map Mockup Widget */}
          <div className="lg:col-span-5 relative">
            <div
              className="w-full h-[450px] rounded-3xl border p-4 shadow-2xl overflow-hidden relative"
              style={{
                backgroundColor: "var(--brand-dark)",
                borderColor: "var(--brand-burgundy)",
              }}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
              <div
                className="absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-full border flex items-center gap-2"
                style={{
                  backgroundColor: "var(--brand-dark)",
                  borderColor: "var(--border-strong)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                  Live Feed
                </span>
              </div>

              <div
                className="absolute top-1/3 left-1/3 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xl flex items-center gap-1.5"
                style={{ backgroundColor: "var(--brand-core)" }}
              >
                <MapPin className="w-3.5 h-3.5" /> Local Shop Point
              </div>

              <div
                className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl shadow-xl border flex items-center gap-3 transition-colors"
                style={{ ...styleElevatedBg, ...styleLightBorder }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--background-tertiary)",
                    color: "var(--brand-core)",
                  }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black transition-colors">
                    3,214 Active Now
                  </h4>
                  <p
                    className="text-xs font-medium transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    users online browsing maps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Dock Bar */}
        <div
          className="mt-16 border p-4 rounded-2xl shadow-xl max-w-5xl mx-auto transition-colors"
          style={{ ...styleElevatedBg, ...styleDefaultBorder }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              className="flex p-1 rounded-xl transition-colors"
              style={styleTertiaryBg}
            >
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                style={{ ...stylePrimaryBg, ...styleLightBorder }}
              >
                Local Pick-Up
              </button>
              <button
                className="px-4 py-2 text-xs font-semibold"
                style={{ color: "var(--text-tertiary)" }}
              >
                Rider Delivery
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                className="border text-xs font-medium p-3 rounded-xl focus:outline-none transition-colors"
                style={{
                  ...styleTertiaryBg,
                  ...styleLightBorder,
                  color: "var(--text-primary)",
                }}
              >
                <option>Select Location / City</option>
              </select>
              <select
                className="border text-xs font-medium p-3 rounded-xl focus:outline-none transition-colors"
                style={{
                  ...styleTertiaryBg,
                  ...styleLightBorder,
                  color: "var(--text-primary)",
                }}
              >
                <option>Select Pickup Date</option>
              </select>
              <select
                className="border text-xs font-medium p-3 rounded-xl focus:outline-none transition-colors"
                style={{
                  ...styleTertiaryBg,
                  ...styleLightBorder,
                  color: "var(--text-primary)",
                }}
              >
                <option>Select Target Time Window</option>
              </select>
            </div>
            <button
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--background-primary)",
              }}
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>
      </section>

      {/* ─── SELLER ONBOARDING: THREE STEPS ─── */}
      <section
        id="how-it-works"
        className="border-y py-20 px-4 sm:px-6 lg:px-8 text-center transition-colors"
        style={{ ...styleSecondaryBg, ...styleLightBorder }}
      >
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--brand-core)" }}
          >
            Seller Onboarding
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight transition-colors">
            Radical Simplicity For Sellers In{" "}
            <span style={{ color: "var(--brand-core)" }}>Three Steps</span> And{" "}
            <span style={{ color: "var(--brand-core)" }}>Thirty Seconds</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Step 1 */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left relative space-y-4 transition-colors"
            style={{ ...styleElevatedBg, ...styleLightBorder }}
          >
            <span
              className="absolute top-4 right-4 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold transition-colors"
              style={{ ...styleTertiaryBg, color: "var(--text-quaternary)" }}
            >
              Step 1 / 3
            </span>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--background-secondary)",
                color: "var(--brand-core)",
              }}
            >
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black transition-colors">1. Snap</h3>
            <p
              className="text-sm leading-relaxed font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Take a photo anywhere, in any lighting condition.
            </p>
            <span
              className="source-code-badge inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--background-tertiary)",
                color: "var(--brand-core)",
              }}
            >
              ~5 sec
            </span>
          </div>

          {/* Step 2 */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left relative space-y-4 transition-colors"
            style={{ ...styleElevatedBg, ...styleLightBorder }}
          >
            <span
              className="absolute top-4 right-4 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold transition-colors"
              style={{ ...styleTertiaryBg, color: "var(--text-quaternary)" }}
            >
              Step 2 / 3
            </span>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--background-secondary)",
                color: "var(--brand-vibrant)",
              }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black transition-colors">
              2. AI Generates
            </h3>
            <p
              className="text-sm leading-relaxed font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Automatically removes background, reads text (OCR), and writes
              descriptions.
            </p>
            <span
              className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--background-tertiary)",
                color: "var(--brand-vibrant)",
              }}
            >
              ~12 sec
            </span>
          </div>

          {/* Step 3 */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left relative space-y-4 transition-colors"
            style={{ ...styleElevatedBg, ...styleLightBorder }}
          >
            <span
              className="absolute top-4 right-4 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold transition-colors"
              style={{ ...styleTertiaryBg, color: "var(--text-quaternary)" }}
            >
              Step 3 / 3
            </span>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--background-secondary)",
                color: "var(--brand-core)",
              }}
            >
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black transition-colors">3. Upload</h3>
            <p
              className="text-sm leading-relaxed font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Enter the price. The product is immediately live on the map.
            </p>
            <span
              className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--background-tertiary)",
                color: "var(--brand-core)",
              }}
            >
              ~10 sec
            </span>
          </div>
        </div>
      </section>

      {/* ─── LIVE CATALOG GRID SECTION ─── */}
      <section
        id="live-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="space-y-1 text-left">
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--brand-core)" }}
            >
              Live Catalog
            </p>
            <h2 className="text-3xl font-black tracking-tight transition-colors">
              Discover What&apos;s Near You
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All Items", "Groceries", "Snacks", "Fresh Produce"].map(
              (filter) => {
                const isActive = activeCatalogFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveCatalogFilter(filter)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm"
                    style={{
                      backgroundColor: isActive
                        ? "var(--text-primary)"
                        : "var(--background-secondary)",
                      color: isActive
                        ? "var(--background-primary)"
                        : "var(--text-secondary)",
                      borderColor: isActive
                        ? "transparent"
                        : "var(--border-default)",
                    }}
                  >
                    {filter}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="border rounded-2xl p-3 shadow-md hover:shadow-lg transition-all group relative"
              style={{ ...styleElevatedBg, ...styleLightBorder }}
            >
              <button
                className="absolute top-5 right-5 p-2 rounded-full border backdrop-blur-sm shadow-sm z-10 hover:text-rose-500 transition-colors"
                style={{ ...styleTertiaryBg, ...styleLightBorder }}
              >
                <Heart className="w-4 h-4 fill-current opacity-40 group-hover:opacity-100" />
              </button>

              {/* ─── OPTIMIZED NEXT.JS IMAGE LOGIC ─── */}
              <div
                className="w-full h-44 rounded-xl overflow-hidden relative"
                style={styleTertiaryBg}
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-left">
                  <h4 className="text-sm font-black transition-colors">
                    {item.name}
                  </h4>
                  <p
                    className="text-xs font-bold mt-0.5 transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {item.price}
                  </p>
                </div>
                <button
                  className="px-3 py-2 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                  style={{ backgroundColor: "var(--brand-core)" }}
                >
                  <ShoppingBag className="w-3 h-3" /> Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PLATFORM OVERVIEW MATRIX PILLARS ─── */}
      <section
        id="ecosystem"
        className="border-t py-20 px-4 sm:px-6 lg:px-8 text-center transition-colors"
        style={{ ...styleSecondaryBg, ...styleLightBorder }}
      >
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--brand-core)" }}
          >
            Platform Overview
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight transition-colors">
            Built For Everyone In The Commerce Ecosystem
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Buyer Card */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left flex flex-col justify-between space-y-6 relative border-t-4 transition-colors"
            style={{
              ...styleElevatedBg,
              ...styleLightBorder,
              borderTopColor: "var(--brand-core)",
            }}
          >
            <div className="space-y-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--brand-core)",
                }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black transition-colors">Buyer</h3>
              <ul
                className="space-y-2.5 text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-core)" }}
                  />{" "}
                  Discover nearby products instantly
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-core)" }}
                  />{" "}
                  Schedule pickup or delivery
                </li>
              </ul>
            </div>
            <button
              className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              style={{ backgroundColor: "var(--brand-core)" }}
            >
              Start Shopping <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Seller Card */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left flex flex-col justify-between space-y-6 relative border-t-4 transition-colors"
            style={{
              ...styleElevatedBg,
              ...styleLightBorder,
              borderTopColor: "var(--brand-vibrant)",
            }}
          >
            <div className="space-y-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--brand-vibrant)",
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black transition-colors">Seller</h3>
              <ul
                className="space-y-2.5 text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-vibrant)" }}
                  />{" "}
                  Upload products in 30 seconds
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-vibrant)" }}
                  />{" "}
                  AI-powered product listing
                </li>
              </ul>
            </div>
            <button
              className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              style={{ backgroundColor: "var(--brand-vibrant)" }}
            >
              Start Selling <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div
            className="border p-8 rounded-2xl shadow-xl text-left flex flex-col justify-between space-y-6 relative border-t-4 transition-colors"
            style={{
              ...styleElevatedBg,
              ...styleLightBorder,
              borderTopColor: "var(--brand-burgundy)",
            }}
          >
            <div className="space-y-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--brand-burgundy)",
                }}
              >
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black transition-colors">Admin</h3>
              <ul
                className="space-y-2.5 text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-burgundy)" }}
                  />{" "}
                  Monitor marketplace activity
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--brand-burgundy)" }}
                  />{" "}
                  Verify merchants
                </li>
              </ul>
            </div>
            <button
              className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              style={{ backgroundColor: "var(--brand-burgundy)" }}
            >
              Open Panel <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER STRUCTURE ─── */}
      <footer
        className="border-t py-16 px-4 sm:px-6 lg:px-8 transition-colors"
        style={{ ...styleElevatedBg, ...styleDefaultBorder }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 items-start text-left">
          <div className="col-span-2 space-y-4">
            <h3 className="text-xl font-black tracking-tight transition-colors">
              Map<span style={{ color: "var(--brand-core)" }}>Anytime</span>
            </h3>
            <p
              className="text-xs font-medium leading-relaxed max-w-xs transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              Our vision is to provide convenience and help increase your sales
              business.
            </p>
          </div>
        </div>
        <div
          className="max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold"
          style={{ ...styleLightBorder, color: "var(--text-quaternary)" }}
        >
          <p>©2026 MapAnytime. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
