"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  Camera,
  ChevronDown,
  Handshake,
  Heart,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  Tag,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useLatestRelease } from "@/features/app-releases/hooks/useLatestRelease";
import { useNearbyStores } from "@/features/stores/hooks/useNearbyStores";
import ApkDownloadModal from "@/components/apk-download-modal";

const LiveHeroMap = dynamic(() => import("@/components/home/LiveHeroMap"), {
  ssr: false,
});

/**
 * The only theme-dependent markup on this page.
 *
 * `resolvedTheme` is undefined during SSR and on the first client render, so picking an icon from
 * it directly is a hydration mismatch. The page used to solve that by returning an empty
 * `<div className="min-h-screen" />` until `mounted` — which meant the server sent *no* marketing
 * copy, headings or links at all, on the one page whose whole job is to be indexed and read
 * before JS arrives. Guarding just this icon costs one wrong-looking glyph for a single frame and
 * lets everything else prerender.
 */
function ThemeIcon({
  mounted,
  resolvedTheme,
}: {
  mounted: boolean;
  resolvedTheme?: string;
}) {
  if (mounted && resolvedTheme === "dark") return <Sun className="w-5 h-5" />;
  return <Moon className="w-5 h-5" />;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCatalogFilter, setActiveCatalogFilter] = useState("All Items");
  const [activeSection, setActiveSection] = useState("home");
  const [activeHowToTab, setActiveHowToTab] = useState<"buy" | "sell">("buy");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const router = useRouter();

  // Same source as the download modal, so the two QR codes on this page can never point at
  // different builds. `downloadUrl` is null until a release is published — the hero QR hides
  // itself rather than encoding a link to a binary that isn't hosted anywhere.
  const { downloadUrl: apkDownloadUrl } = useLatestRelease();

  // Real storefronts for the discovery grid, replacing three hardcoded Unsplash entries that
  // carried invented ratings and review counts.
  const { stores: nearbyStores, loading: storesLoading } = useNearbyStores(6);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
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
              href="/register"
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
                href="/register"
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

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="home"
          className="scroll-mt-20 px-margin-mobile md:px-gutter min-h-[calc(100vh-80px)] max-w-container-max mx-auto relative overflow-hidden flex flex-col justify-center"
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="flex flex-col gap-12 items-center text-center relative z-10 w-full">
            {/* Text Content */}
            <div className="max-w-5xl space-y-stack-md flex flex-col items-center">
              <p className="font-mono text-label-caps text-primary tracking-widest uppercase">
                Shop the map, anytime, anywhere.
              </p>
              <h1 className="font-display text-display-xl text-on-surface leading-tight transition-colors">
                Connecting <span className="text-primary">Local</span> Stores to
                the World Through a Map, a Photo, and a Seamless Pickup
                Experience.
              </h1>
              <p className="font-body text-body-lg text-on-surface-variant max-w-2xl transition-colors">
                Discover hyperlocal products from neighborhood stores, markets,
                and pop-ups — pinned live on a map near you.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 pt-8 w-full max-w-3xl">
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="group relative flex items-center bg-surface border border-outline-variant/30 rounded-full p-2 pr-8 hover:border-primary/50 hover:bg-surface-container-low hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95"
                >
                  <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="ml-4 flex flex-col text-left">
                    <span className="font-display text-on-surface text-[16px] font-bold leading-tight">
                      Shop the Market
                    </span>
                    <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                      GET THE APP
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/register")}
                  className="group relative flex items-center bg-surface border border-outline-variant/30 rounded-full p-2 pr-8 hover:border-secondary/50 hover:bg-surface-container-low hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95"
                >
                  <div className="bg-secondary text-on-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="ml-4 flex flex-col text-left">
                    <span className="font-display text-on-surface text-[16px] font-bold leading-tight">
                      Join the Market
                    </span>
                    <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                      Seller Sign Up
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS: BUY & SELL ─── */}
        <section
          id="how-it-works"
          className="scroll-mt-20 py-20 px-margin-mobile md:px-gutter text-center transition-colors min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full relative flex flex-col">
            {/* Mobile/Tablet Stacked Layout (Hidden on Desktop) */}
            <div className="flex flex-col lg:hidden gap-6 w-full max-w-lg mx-auto">
              {/* Mobile Toggle Buttons */}
              <div className="flex justify-center gap-4 mb-2">
                <button
                  onClick={() => setActiveHowToTab("buy")}
                  className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-display text-[14px] transition-all duration-300 ${
                    activeHowToTab === "buy"
                      ? "bg-primary text-on-primary shadow-lg border-2 border-primary"
                      : "bg-surface border-2 border-outline-variant/30 text-primary"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" /> Buy
                </button>
                <button
                  onClick={() => setActiveHowToTab("sell")}
                  className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-display text-[14px] transition-all duration-300 ${
                    activeHowToTab === "sell"
                      ? "bg-secondary text-on-secondary shadow-lg border-2 border-secondary"
                      : "bg-surface border-2 border-outline-variant/30 text-secondary"
                  }`}
                >
                  <Store className="w-5 h-5" /> Sell
                </button>
              </div>

              {/* Mobile Info Card */}
              <div className="bg-surface rounded-[2rem] p-6 sm:p-8 border border-outline-variant/20 shadow-xl text-left transition-all duration-500 relative overflow-hidden">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${activeHowToTab === "buy" ? "bg-primary" : "bg-secondary"}`}
                ></div>
                <h3 className="font-display text-[24px] text-on-surface uppercase font-black mb-2 relative z-10">
                  HOW TO {activeHowToTab.toUpperCase()}
                </h3>
                <p className="text-on-surface-variant text-[14px] mb-6 relative z-10">
                  {activeHowToTab === "buy"
                    ? "Find your perfect local store and connect."
                    : "List your store items and connect with buyers."}
                </p>
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-inner">
                  <Image
                    src={
                      activeHowToTab === "buy"
                        ? "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&q=80"
                        : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
                    }
                    alt="Storefront"
                    fill
                    className="object-cover transition-all duration-700 hover:scale-105"
                  />
                </div>
              </div>

              {/* Mobile Steps */}
              <div className="flex flex-col gap-4">
                {(activeHowToTab === "buy"
                  ? [
                      {
                        num: "01",
                        title: "Find a Store",
                        desc: "Explore stores based on location & products.",
                        icon: Search,
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        num: "02",
                        title: "View Details",
                        desc: "Check photos, store hours and the exact location.",
                        icon: Store,
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                      },
                      {
                        num: "03",
                        title: "Contact Seller",
                        desc: "Send an inquiry or reserve an item directly.",
                        icon: MessageCircle,
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        num: "04",
                        title: "Complete Purchase",
                        desc: "Coordinate pickup directly with the local store.",
                        icon: Handshake,
                        color: "text-green-500",
                        bg: "bg-green-500/10",
                      },
                    ]
                  : [
                      {
                        num: "01",
                        title: "Create Profile",
                        desc: "Set up your local seller profile in a few minutes.",
                        icon: UserPlus,
                        color: "text-secondary",
                        bg: "bg-secondary/10",
                      },
                      {
                        num: "02",
                        title: "Add Products",
                        desc: "Upload photos, price, and pin your store location.",
                        icon: Camera,
                        color: "text-orange-500",
                        bg: "bg-orange-500/10",
                      },
                      {
                        num: "03",
                        title: "Publish Store",
                        desc: "Make your store visible on the live map instantly.",
                        icon: Megaphone,
                        color: "text-purple-500",
                        bg: "bg-purple-500/10",
                      },
                      {
                        num: "04",
                        title: "Connect",
                        desc: "Receive inquiries from buyers and close deals.",
                        icon: Users,
                        color: "text-orange-500",
                        bg: "bg-orange-500/10",
                      },
                    ]
                ).map((step) => (
                  <div
                    key={step.num}
                    className="bg-surface border border-outline-variant/20 p-5 rounded-2xl shadow-md text-left flex gap-4 items-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.bg} ${step.color}`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                        {step.title}
                      </h4>
                      <p className="text-[12px] text-on-surface-variant leading-tight">
                        {step.desc}
                      </p>
                    </div>
                    <div className="font-mono text-[18px] font-black text-outline-variant/30">
                      {step.num}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── DESKTOP STATIC LAYOUT (No layout shift on toggle) ─── */}
            <div className="hidden lg:flex flex-row w-full relative">
              {/* Toggle Switcher - Placed exactly in the bottom-left corner */}
              <div className="absolute bottom-10 left-10 z-30 bg-surface border border-outline-variant/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-1.5 flex gap-1 w-fit animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setActiveHowToTab("buy")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-bold text-[15px] transition-all duration-300 ${
                    activeHowToTab === "buy"
                      ? "bg-primary text-on-primary shadow-md"
                      : "text-slate-600 hover:bg-surface-container"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  How To Buy
                </button>
                <button
                  onClick={() => setActiveHowToTab("sell")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-bold text-[15px] transition-all duration-300 ${
                    activeHowToTab === "sell"
                      ? "bg-secondary text-on-secondary shadow-md"
                      : "text-slate-600 hover:bg-surface-container"
                  }`}
                >
                  <Store className="w-5 h-5" />
                  How To Sell
                </button>
              </div>

              {/* Left Side: Diagonal Steps */}
              <div className="flex-1 flex flex-col justify-center gap-6 pl-8 pr-12 py-12 pb-32">
                {(activeHowToTab === "buy"
                  ? [
                      {
                        num: "01",
                        title: "Find a Store",
                        desc: "Explore stores on the live map based on location, products & more.",
                        icon: Search,
                        colorText: "text-primary",
                        colorBg: "bg-transparent",
                        borderColor:
                          "border-outline-variant/20 hover:border-primary/40",
                      },
                      {
                        num: "02",
                        title: "View Details",
                        desc: "Browse photos, available items, availability and the exact location.",
                        icon: Store,
                        colorText: "text-blue-500",
                        colorBg: "bg-blue-500/10",
                        borderColor:
                          "border-blue-500/20 hover:border-blue-500/40",
                      },
                      {
                        num: "03",
                        title: "Contact Seller",
                        desc: "Choose your items, add them to your cart and place your order with the store.",
                        icon: MessageCircle,
                        colorText: "text-primary",
                        colorBg: "bg-transparent",
                        borderColor:
                          "border-outline-variant/20 hover:border-primary/40",
                      },
                      {
                        num: "04",
                        title: "Complete Purchase",
                        desc: "Coordinate pickup directly with the local store and collect your item.",
                        icon: Handshake,
                        colorText: "text-green-500",
                        colorBg: "bg-green-500/10",
                        borderColor:
                          "border-green-500/20 hover:border-green-500/40",
                      },
                    ]
                  : [
                      {
                        num: "01",
                        title: "Create Profile",
                        desc: "Sign up and set up your local seller profile in just a few minutes.",
                        icon: UserPlus,
                        colorText: "text-slate-600 dark:text-slate-300",
                        colorBg: "bg-transparent",
                        borderColor:
                          "border-outline-variant/20 hover:border-slate-400/50",
                      },
                      {
                        num: "02",
                        title: "Publish Store",
                        desc: "Make your store visible on the live map and instantly reach locals.",
                        icon: Megaphone,
                        colorText: "text-purple-500",
                        colorBg: "bg-purple-500/10",
                        borderColor:
                          "border-purple-500/30 hover:border-purple-500/50",
                      },
                      {
                        num: "03",
                        title: "Add Products",
                        desc: "Upload photos, add product details, set prices and organize your inventory.",
                        icon: Camera,
                        colorText: "text-orange-500",
                        colorBg: "bg-orange-500/10",
                        borderColor:
                          "border-orange-500/30 hover:border-orange-500/50",
                      },
                      {
                        num: "04",
                        title: "Connect",
                        desc: "Receive inquiries from interested buyers nearby and close deals faster.",
                        icon: Users,
                        colorText: "text-orange-500",
                        colorBg: "bg-orange-500/10",
                        borderColor:
                          "border-orange-500/30 hover:border-orange-500/50",
                      },
                    ]
                ).map((step, idx) => (
                  <div
                    key={step.num + activeHowToTab}
                    className={`bg-surface border py-5 px-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.03)] flex items-center gap-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${step.borderColor} w-[88%] xl:w-[78%] animate-in fade-in slide-in-from-left-4`}
                    style={{
                      marginLeft: `${idx * 10}%`,
                      animationDelay: `${idx * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${step.colorBg} ${step.colorText}`}
                    >
                      <step.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left pr-4">
                      <h4 className="font-display text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-1">
                        {step.title}
                      </h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <span className="font-mono text-[22px] font-black text-slate-800 dark:text-slate-100 pl-2 tracking-tighter">
                      {step.num}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Side: Static Info Card */}
              <div className="w-[38%] xl:w-[32%] flex-shrink-0 pt-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-surface rounded-[2.5rem] p-8 border border-outline-variant/20 shadow-[0_10px_40px_rgb(0,0,0,0.08)] flex flex-col h-full min-h-[460px] relative overflow-hidden group transition-colors duration-500">
                  {/* Beautiful Frosted Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b opacity-25 transition-colors duration-1000 ${activeHowToTab === "buy" ? "from-primary" : "from-secondary"} to-transparent pointer-events-none`}
                  ></div>

                  <div className="relative z-10 flex flex-col items-start mb-8 flex-1">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg transition-colors duration-500 ${activeHowToTab === "buy" ? "bg-primary text-on-primary shadow-primary/30" : "bg-secondary text-on-secondary shadow-secondary/30"}`}
                    >
                      {activeHowToTab === "buy" ? (
                        <ShoppingBag className="w-[26px] h-[26px]" />
                      ) : (
                        <Tag className="w-[26px] h-[26px]" />
                      )}
                    </div>
                    <h3 className="font-display text-[28px] text-on-surface uppercase tracking-tight font-black mb-3 transition-colors">
                      HOW TO {activeHowToTab.toUpperCase()}
                    </h3>
                    <p className="text-on-surface-variant text-[14px] leading-relaxed text-left transition-colors duration-300">
                      {activeHowToTab === "buy"
                        ? "Find your perfect local store and connect with sellers effortlessly."
                        : "List your store items and connect with serious local buyers in your area."}
                    </p>
                  </div>

                  <div className="relative w-full h-[200px] rounded-3xl overflow-hidden shadow-inner border border-outline-variant/20 z-10 bg-surface-container">
                    <Image
                      src={
                        activeHowToTab === "buy"
                          ? "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&q=80"
                          : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
                      }
                      alt="Storefront"
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent"></div>

                    {/* Image Floating Badges */}
                    {activeHowToTab === "buy" ? (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full border-[3px] border-surface flex items-center justify-center text-on-primary shadow-xl glow-pulse transition-all duration-500">
                        <MapPin className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-5 py-2 rounded-2xl border-2 border-secondary flex flex-col items-center shadow-xl font-bold transition-all duration-500">
                        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-0.5">
                          Live Now
                        </span>
                        <span className="text-[13px] text-secondary">
                          Your Store
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── EXPLORE LIVE MAP SECTION ─── */}
        <section
          id="map"
          className="scroll-mt-24 pt-6 pb-6 w-full overflow-hidden bg-background relative z-10 transition-colors"
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
              {/* Map Column (Left 50%) */}
              <div className="flex-1 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl border border-outline-variant/10 relative z-10 bg-surface-container-lowest transition-all h-[450px] xl:h-[600px]">
                {/* The map component renders its own zoom/location controls natively. */}
                <LiveHeroMap />
              </div>

              {/* Content Column (Right 50%) */}
              <div className="flex-1 flex flex-col gap-4 lg:gap-5 h-auto xl:h-[600px]">
                {/* Header & Typography */}
                <div>
                  <h2 className="font-display text-[36px] leading-[1.1] font-extrabold text-on-surface tracking-tight mb-3">
                    Discover <span className="text-primary">What&apos;s</span>
                    <br />
                    <span className="text-primary">Near You</span>
                  </h2>
                  <p className="text-on-surface-variant font-body text-[15px] max-w-[400px]">
                    Find local stores, fresh products, and great deals around
                    your location.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-2 rounded-full text-sm font-bold bg-primary text-on-primary shadow-sm hover:bg-primary-fixed transition-colors">
                    All
                  </button>
                  <button className="px-6 py-2 rounded-full text-sm font-bold bg-surface border border-outline-variant/20 text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors">
                    Groceries
                  </button>
                  <button className="px-6 py-2 rounded-full text-sm font-bold bg-surface border border-outline-variant/20 text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors">
                    Snacks
                  </button>
                  <button className="px-6 py-2 rounded-full text-sm font-bold bg-surface border border-outline-variant/20 text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors">
                    Fresh Produce
                  </button>
                  <button className="px-5 py-2 rounded-full text-sm font-bold bg-surface border border-outline-variant/20 text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors flex items-center gap-1">
                    More <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Store Grid — real nearby storefronts, see useNearbyStores */}
                {storesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-surface rounded-[24px] border border-outline-variant/10 h-[220px] animate-pulse"
                      />
                    ))}
                  </div>
                ) : nearbyStores.length === 0 ? (
                  <div className="rounded-[24px] border border-outline-variant/20 bg-surface p-8 text-center">
                    <Store className="w-8 h-8 text-on-surface-variant mx-auto mb-3" />
                    <p className="text-[15px] font-bold text-on-surface mb-1">
                      No stores near you yet
                    </p>
                    <p className="text-[13px] text-on-surface-variant">
                      Be the first — register a store and appear on the map for
                      buyers in your area.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {nearbyStores.map((store) => (
                      <div
                        key={store.id}
                        className="bg-surface rounded-[24px] shadow-md hover:shadow-xl transition-all group relative flex flex-col overflow-hidden border border-outline-variant/10"
                      >
                        <button
                          className="absolute top-4 right-4 p-2 rounded-full bg-surface shadow-sm text-on-surface-variant hover:text-error transition-colors z-10 w-8 h-8 flex items-center justify-center"
                          aria-label={`Save ${store.storeName}`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <div className="w-full h-[100px] relative bg-surface-container-low overflow-hidden">
                          {store.logoUrl ? (
                            /* `unoptimized` because store logos come from user uploads on hosts
                               that aren't in next.config's remotePatterns whitelist — routing them
                               through /_next/image would 400. */
                            <Image
                              src={store.logoUrl}
                              alt={store.storeName}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 200px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                              <Store className="w-7 h-7" />
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <h4 className="font-bold text-[14px] text-on-surface leading-tight truncate mb-1">
                            {store.storeName}
                          </h4>
                          <div className="flex items-center text-[12px] text-on-surface-variant mb-3 font-medium truncate">
                            {store.address?.city ||
                              store.address?.currentAddress}
                            <span className="mx-1">•</span>
                            {store.distanceKm.toFixed(1)} km
                          </div>

                          {/* No rating or review count: /stores/nearby does not return them, and
                              the previous hardcoded 4.8-5.0 stars were invented. */}
                          <div className="flex items-center justify-end mb-4">
                            <span
                              className={`text-[12px] font-bold ${store.isActive ? "text-primary" : "text-on-surface-variant"}`}
                            >
                              {store.isActive ? "Open" : "Closed"}
                            </span>
                          </div>

                          <Link
                            href={`/store/${store.id}`}
                            className="w-full mt-auto py-2.5 bg-primary text-on-primary font-bold text-[13px] rounded-xl transition-colors hover:bg-primary-fixed shadow-sm text-center"
                          >
                            View Store
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* App Download Banner */}
                <div className="mt-auto shrink-0 rounded-[24px] p-4 flex items-center gap-6 border border-outline-variant/20 relative overflow-hidden bg-surface shadow-sm">
                  {/* Background Image & Gradient */}
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-OcVWr9arxes?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-80"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-transparent"></div>
                  </div>

                  <div className="flex-1 py-2 relative z-10">
                    <h4 className="font-bold text-[18px] text-on-surface mb-1">
                      Take the Map Anytime with you!
                    </h4>
                    <p className="text-[13px] text-on-surface-variant mb-4">
                      Get the app for the best experience.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        disabled
                        className="bg-surface text-on-surface flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/20 shadow-sm opacity-60 cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                          className="w-4 h-4 fill-current"
                        >
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                        </svg>
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] leading-none">
                            Download on the
                          </span>
                          <span className="text-[12px] font-bold leading-tight flex items-center">
                            App Store{" "}
                            <span className="ml-1.5 text-[7px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/50 px-1 rounded-full font-bold">
                              Coming Soon
                            </span>
                          </span>
                        </div>
                      </button>
                      <button
                        disabled
                        className="bg-surface text-on-surface flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/20 shadow-sm opacity-60 cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4 fill-current"
                        >
                          <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                        </svg>
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] leading-none">
                            GET IT ON
                          </span>
                          <span className="text-[12px] font-bold leading-tight flex items-center">
                            Google Play{" "}
                            <span className="ml-1.5 text-[7px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/50 px-1 rounded-full font-bold">
                              Coming Soon
                            </span>
                          </span>
                        </div>
                      </button>
                      {/* Opens the release modal. This had no onClick at all — the primary
                          download CTA on the page was inert. */}
                      <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="bg-surface-container-highest text-on-surface flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/20 shadow-sm hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors group"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4 fill-current group-hover:scale-110 transition-transform"
                        >
                          <path d="M279.1 156.4h-46.2l-21.7-41.9c-2.3-4.4-7.7-6.1-12.1-3.8-4.4 2.3-6.1 7.7-3.8 12.1l22.4 43.1C164.4 186.8 126 242.4 126 308h260c0-65.6-38.4-121.2-91.7-142.1l22.4-43.1c2.3-4.4 .6-9.8-3.8-12.1-4.4-2.3-9.8-.6-12.1 3.8l-21.7 41.9zM192 252c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm128 0c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm-204.6 66h32.2V428c0 17.7 14.3 32 32 32h20c17.7 0 32-14.3 32-32V318h16V428c0 17.7 14.3 32 32 32h20c17.7 0 32-14.3 32-32V318h32.2c17.7 0 32-14.3 32-32V176c0-17.7-14.3-32-32-32H115.4c-17.7 0-32 14.3-32 32V286c0 17.7 14.3 32 32 32z" />
                        </svg>
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] leading-none">
                            Download direct
                          </span>
                          <span className="text-[12px] font-bold leading-tight">
                            Android APK
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                  {mounted && apkDownloadUrl && (
                    <div className="hidden lg:block w-16 h-16 bg-surface p-1 rounded-xl shadow-sm border border-outline-variant/20 mr-2 shrink-0 relative z-10">
                      <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-white">
                        {/* Rendered locally rather than fetched from api.qrserver.com. A remote QR
                            puts a third party in the critical path of the primary download CTA —
                            if they're down or rate-limiting, this renders as a broken image. */}
                        <QRCodeSVG
                          value={apkDownloadUrl}
                          size={100}
                          level="M"
                          title="Download the MapAnytime Android APK"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Features Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 mt-10 border-t border-outline-variant/10 w-full max-w-6xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                    Find Nearby Stores
                  </h4>
                  <p className="text-[13px] text-on-surface-variant leading-tight">
                    Explore stores and products near your location.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <Tag className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                    Real-time Updates
                  </h4>
                  <p className="text-[13px] text-on-surface-variant leading-tight">
                    Live store status and product availability.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                    Trusted & Rated
                  </h4>
                  <p className="text-[13px] text-on-surface-variant leading-tight">
                    Top-rated stores you can trust and rely on.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-on-surface mb-0.5">
                    Pick Up & Save
                  </h4>
                  <p className="text-[13px] text-on-surface-variant leading-tight">
                    Order online and pick up at your convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PLATFORM OVERVIEW MATRIX PILLARS ─── */}
        <section
          id="ecosystem"
          className="scroll-mt-20 py-24 px-margin-mobile md:px-gutter text-center transition-colors min-h-[calc(100vh-80px)] flex flex-col justify-center bg-surface relative overflow-hidden z-0"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto space-y-4 mb-20 relative z-10">
            <p className="font-mono text-label-caps text-primary tracking-widest uppercase font-bold">
              The MapAnytime Ecosystem
            </p>
            <h2 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold transition-colors">
              One Platform. Every Journey.
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto mt-4 text-lg">
              Whether you want to shop locally, grow your store, or help
              businesses join the market, MapAnytime has a place for you.
            </p>
          </div>

          <div className="relative max-w-7xl mx-auto w-full z-10">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 w-full relative z-10">
              {/* Agent Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-tertiary transition-all duration-300 hover:-translate-y-2 group">
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-tertiary-container text-on-tertiary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                    <Handshake className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-on-surface font-bold transition-colors">
                    Agent
                  </h3>
                  <p className="font-body text-on-surface-variant text-center">
                    Find local businesses and connect them to the MapAnytime
                    market.
                  </p>
                </div>
                <button className="w-full py-3.5 bg-surface text-tertiary border border-tertiary/30 font-display rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-tertiary hover:text-on-tertiary transition-colors group-hover:border-tertiary font-bold">
                  Become an Agent <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Seller Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-secondary transition-all duration-300 hover:-translate-y-2 group lg:-mt-8">
                {/* Connecting Line from Agent */}
                <div className="hidden lg:flex absolute top-[40%] -left-[3rem] xl:-left-[3rem] w-[3rem] items-center -z-10 justify-center">
                  <div className="h-0.5 w-full border-t-2 border-dashed border-tertiary/40" />
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-tertiary/50" />
                </div>
                {/* Connecting Line to Buyer */}
                <div className="hidden lg:flex absolute top-[40%] -right-[3rem] xl:-right-[3rem] w-[3rem] items-center -z-10 justify-center">
                  <div className="h-0.5 w-full border-t-2 border-dashed border-secondary/40" />
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-secondary/50" />
                </div>
                {/* Connecting Line from Buyer back to Seller (Continuous network effect) */}
                <div className="hidden lg:flex absolute top-[60%] -right-[3rem] xl:-right-[3rem] w-[3rem] items-center -z-10 justify-center">
                  <div className="h-0.5 w-full border-t-2 border-dashed border-primary/40" />
                  <div className="absolute left-0 w-2 h-2 rounded-full bg-primary/50" />
                </div>

                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-secondary-container text-on-secondary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                    <Store className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-on-surface font-bold transition-colors">
                    Seller
                  </h3>
                  <p className="font-body text-on-surface-variant text-center">
                    Bring your products online and reach nearby buyers.
                  </p>
                </div>
                <button className="w-full py-3.5 bg-secondary text-on-secondary font-display rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-secondary-fixed hover:shadow-lg transition-all font-bold">
                  Start Selling <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Buyer Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-between space-y-6 relative border-t-4 border-t-primary transition-all duration-300 hover:-translate-y-2 group">
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-primary-container text-on-primary-container transition-colors shadow-sm group-hover:scale-110 duration-300">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-on-surface font-bold transition-colors">
                    Buyer
                  </h3>
                  <p className="font-body text-on-surface-variant text-center">
                    Discover nearby products and shop from local stores.
                  </p>
                </div>
                <button className="w-full py-3.5 bg-primary text-on-primary font-display rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary-fixed hover:shadow-lg transition-all font-bold">
                  Start Shopping <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim mt-auto border-t border-surface-container-low transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-md px-margin-mobile md:px-gutter py-section-gap max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link
              href="/"
              className="font-display text-headline-md font-bold text-primary"
            >
              MapAnytime
            </Link>
            <p className="font-body text-body-md text-on-surface-variant max-w-sm transition-colors">
              © 2026 MapAnytime. Bridging digital discovery and physical
              neighborhood commerce.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-display text-button-text text-on-surface transition-colors">
              Platform
            </h4>
            <ul className="space-y-2 flex flex-col">
              <Link
                href="#"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Marketplace Categories
              </Link>
              <Link
                href="#"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Active Stores
              </Link>
              <Link
                href="/seller"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Merchant Hub
              </Link>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-display text-button-text text-on-surface transition-colors">
              Legal & Support
            </h4>
            <ul className="space-y-2 flex flex-col">
              <Link
                href="#"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
              >
                Contact Support
              </Link>
            </ul>
          </div>
        </div>
      </footer>
      {/* Download App Modal — the real one: live release metadata, checksum, QR, install
          guide and version history. This used to be a small inline stub whose "Download APK"
          button had no onClick, while ApkDownloadModal sat unimported. */}
      <ApkDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
