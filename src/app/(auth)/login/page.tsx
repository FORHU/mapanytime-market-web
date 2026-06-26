"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";

export default function UnifiedSignInPage() {
  const router = useRouter();

  // Guard state to prevent hydration mismatches from browser extensions
  const [mounted, setMounted] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── DEVELOPMENT PROFILE AUTO-BYPASS ACCELERATION ──
  const handleDevBypass = () => {
    const mockSessionId =
      "sess_bypass_" + Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem("sessionId", mockSessionId);
    localStorage.setItem("userRole", "seller");

    // FIXED: Now safely directs developers to the main Managed Stores route path
    setTimeout(() => {
      router.push("/seller/store");
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const simulateAuthCheck = () => {
        return new Promise<{
          role: "buyer" | "seller";
          status: "APPROVED" | "PENDING";
        }>((resolve) => {
          setTimeout(() => {
            if (email.includes("pending")) {
              resolve({ role: "seller", status: "PENDING" });
            } else if (email.includes("seller")) {
              resolve({ role: "seller", status: "APPROVED" });
            } else {
              resolve({ role: "buyer", status: "APPROVED" });
            }
          }, 800);
        });
      };

      const userAccount = await simulateAuthCheck();

      if (userAccount.role === "seller" && userAccount.status === "PENDING") {
        setErrorMessage(
          "Your merchant application is under review. You will receive an email once approved.",
        );
        setIsLoading(false);
        return;
      }

      const mockSessionId =
        "sess_" + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("sessionId", mockSessionId);
      localStorage.setItem("userRole", userAccount.role);

      if (userAccount.role === "seller") {
        // FIXED: Realigned real production form sign-ins to route to the main Managed Stores layout route
        setTimeout(() => {
          router.push("/seller/store");
        }, 0);
      } else {
        setTimeout(() => {
          router.push("/dashboard");
        }, 0);
      }
    } catch (err) {
      setErrorMessage("Authentication pipeline failure. Try again.");
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <AuthLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
          <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
          <div className="space-y-4 pt-4">
            <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            <div className="h-12 bg-white/10 rounded-xl w-full"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-text-secondary font-medium">
            Enter your credentials to manage your layouts.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-white/20 transition-colors"
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none focus:border-white/20 transition-colors"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? "Checking Access..." : "Sign In"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-sm text-text-tertiary text-center">
          Do not have an account?{" "}
          <Link
            href="/register"
            className="text-brand-light font-bold hover:underline"
          >
            Get Started
          </Link>
        </p>

        {/* DEVELOPMENT ENV ACCELERATION CONTROL ELEMENT */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t border-dashed border-white/10">
            <button
              type="button"
              onClick={handleDevBypass}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Dev Auto-Bypass: Fast Track Managed Stores</span>
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
