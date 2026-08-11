"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Store,
  Search,
  MessageCircle,
  Handshake,
  UserPlus,
  Camera,
  Megaphone,
  Users,
} from "lucide-react";

export default function HowItWorksSection() {
  const [activeHowToTab, setActiveHowToTab] = useState<"buy" | "sell">("buy");

  return (
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
                    borderColor: "border-blue-500/20 hover:border-blue-500/40",
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
                    title: "Connect & Sell",
                    desc: "Receive orders, coordinate with buyers and grow your local business.",
                    icon: Users,
                    colorText: "text-green-600",
                    colorBg: "bg-green-600/10",
                    borderColor:
                      "border-green-600/30 hover:border-green-600/50",
                  },
                ]
            ).map((step, idx) => (
              <div
                key={step.num}
                className={`flex gap-6 items-center p-6 rounded-[2rem] bg-surface border shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 w-full max-w-md ${step.borderColor} ${
                  idx === 0
                    ? "ml-0"
                    : idx === 1
                      ? "ml-12"
                      : idx === 2
                        ? "ml-24"
                        : "ml-36"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 ${step.colorBg} border border-outline-variant/10`}
                >
                  <step.icon className={`w-8 h-8 ${step.colorText}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[14px] font-bold text-outline-variant/40">
                      {step.num}
                    </span>
                    <h4 className="font-display font-bold text-[18px] text-on-surface">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Floating Image */}
          <div className="flex-1 relative flex items-center justify-center p-12">
            <div className="relative w-full aspect-square max-w-lg">
              <div
                className={`absolute inset-0 blur-3xl opacity-20 rounded-full transition-colors duration-700 ${activeHowToTab === "buy" ? "bg-primary" : "bg-secondary"}`}
              ></div>
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-[8px] border-surface shadow-2xl z-10">
                <Image
                  src={
                    activeHowToTab === "buy"
                      ? "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1000&q=80"
                      : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80"
                  }
                  alt={
                    activeHowToTab === "buy"
                      ? "Buying locally"
                      : "Selling locally"
                  }
                  fill
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 z-20 bg-surface p-4 rounded-2xl shadow-xl border border-outline-variant/20 flex items-center gap-3 animate-bounce-slow">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${activeHowToTab === "buy" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                >
                  {activeHowToTab === "buy" ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <Store className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-bold text-on-surface">
                    {activeHowToTab === "buy"
                      ? "Fresh Produce"
                      : "Live Storefront"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {activeHowToTab === "buy" ? "Available now" : "Online"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
