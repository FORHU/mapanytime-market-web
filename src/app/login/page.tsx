"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";

export default function UnifiedSignInPage() {
  const router = useRouter();

  // Guard state to prevent hydration mismatches from browser extensions
  const [mounted, setMounted] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Delay rendering form interactive states until client mounting is complete
  // Auto-bypass login for development/testing
  useEffect(() => {
    setMounted(true);

    // 🛠️ BYPASS TRIGGER: Instantly logs in as an approved seller
    const bypassToSellerDashboard = () => {
      const mockSessionId =
        "sess_bypass_" + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("sessionId", mockSessionId);
      localStorage.setItem("userRole", "seller");

      router.push("/seller/dashboard");
    };

    bypassToSellerDashboard();
  }, [router]); // ✅ Properly closing the useEffect block here

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
        router.push("/seller/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage("Authentication pipeline failure. Try again.");
      setIsLoading(false);
    }
  };

  // If not mounted yet, render a matching visual skeleton or return null
  // to let the client smoothly take over without hydration clashes
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
            className="w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-text-primary"
            autoComplete="username"
            suppressHydrationWarning
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-text-primary"
            autoComplete="current-password"
            suppressHydrationWarning
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white flex items-center justify-center gap-2 cursor-pointer"
            suppressHydrationWarning
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
      </div>
    </AuthLayout>
  );
}
