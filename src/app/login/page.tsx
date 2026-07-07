"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  return (
    // Outer dynamic flex wrapper maximizing viewport frame scale
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
      {/* Centered card module bumped up to max-w-md for optimal visual density */}
      <Card className="w-full max-w-md p-8 shadow-xl border border-[var(--border-default)]">
        <div className="text-center space-y-2 mb-6">
          <div className="text-xl font-black tracking-tight">
            Map<span className="text-[var(--brand-core)]">Central</span>
          </div>
          <h2 className="text-base font-black">Welcome Back to MapAnytime</h2>
          <p className="text-xs text-zinc-400">
            Access your merchant portal or buyer credentials
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <a href="#" className="text-[10px] text-zinc-400 hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border rounded-xl text-xs bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="!h-11 mt-2"
          >
            Secure Sign In
          </Button>
        </form>

        <div className="text-center mt-6 text-[11px] text-zinc-400">
          {" Don't have an account?"}
          <Link
            href="/register"
            className="font-bold text-[var(--brand-core)] hover:underline"
          >
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
}
