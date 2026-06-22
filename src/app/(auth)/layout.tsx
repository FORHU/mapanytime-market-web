"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background-primary text-text-primary overflow-hidden relative">
      {/* Left Container: Form Injection */}
      <div className="flex flex-col justify-between p-6 md:p-12 relative z-10 bg-background-primary/40 backdrop-blur-sm min-h-screen">
        <Link href="/" className="flex items-center gap-2 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-core to-brand-vibrant flex items-center justify-center glow-primary">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-md opacity-80 group-hover:opacity-100 transition-opacity">
            BOILERPLATE 2026
          </span>
        </Link>

        <main className="w-full max-w-md mx-auto my-auto py-10">
          {children}
        </main>

        <p className="text-xs text-text-quaternary text-center lg:text-left font-medium">
          © 2026 Boilerplate Labs. Secure environment.
        </p>
      </div>

      {/* Right Container: Animated Visual Sidecar (Hidden on mobile) */}
      <div className="hidden lg:flex relative items-center justify-center bg-brand-dark overflow-hidden border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.08),transparent_60%)]" />
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute w-[600px] h-[600px] bg-brand-core/10 blur-[120px] rounded-full"
        />

        <div className="relative z-10 max-w-md text-center px-6">
          <h2 className="text-4xl font-black mb-4 tracking-tight text-white leading-tight">
            The Hyperlocal Retail <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand-vibrant">
              Revolution
            </span>
          </h2>
          <p className="text-text-secondary text-sm font-medium leading-relaxed opacity-80">
            Join the digital map network transforming offline physical retail
            globally. One photo, one pin, infinite connection.
          </p>
        </div>
      </div>
    </div>
  );
}
