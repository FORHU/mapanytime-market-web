"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react"; // Ensure React is imported
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f9fafb] text-slate-900 overflow-hidden relative font-sans antialiased">
      {/* Left Container: Form Injection */}
      <div className="flex flex-col justify-between p-6 md:p-12 relative z-10 bg-white/40 backdrop-blur-xs min-h-screen border-r border-slate-100">
        <Link href="/" className="flex items-center gap-2 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/10">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-black tracking-tight text-md text-emerald-600 flex items-center gap-0.5">
            Map<span className="text-slate-900">Anytime</span>
          </span>
        </Link>

        <main className="w-full max-w-md mx-auto my-auto py-10">
          {children}
        </main>

        <p className="text-xs text-slate-400 text-center lg:text-left font-bold">
          © 2026 MapAnytime. Secure merchant environment.
        </p>
      </div>

      {/* Right Container: Animated Visual Sidecar (Hidden on mobile) */}
      <div className="hidden lg:flex relative items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_60%)]" />
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full"
        />

        <div className="relative z-10 max-w-md text-center px-6 space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
            The Hyperlocal Retail <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Revolution
            </span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
            Join the digital map network transforming offline physical retail
            globally. One photo, one pin, infinite connection.
          </p>
        </div>
      </div>
    </div>
  );
}
