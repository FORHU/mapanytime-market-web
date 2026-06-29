"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout";

export default function UnifiedSignInPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://192.168.1.176:3002/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        },
      );

      const dbData = await response.json();

      if (!response.ok) {
        throw new Error(dbData?.message || "Invalid account credentials.");
      }

      // Extract token envelope block parameter strictly
      const sessionToken = dbData?.data?.accessToken;

      if (!sessionToken) {
        throw new Error(
          "Handshake succeeded, but data.accessToken envelope layer is missing.",
        );
      }

      // Save credentials straight away
      localStorage.setItem("token", sessionToken);
      localStorage.setItem("userRole", "seller"); // ◄ forced hardcoded seller local override

      // 🛑 BYPASS ALL PAYLOAD VALS AND FORCE MERCH ONBOARDING TARGET DIRECTLY
      alert(
        "Authentication Success! Loading your Store Onboarding portal view.",
      );
      router.push("/seller/onboarding");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Authentication pipeline cluster down.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Merchant Portal
          </h1>
          <p className="text-sm text-text-secondary font-medium">
            Log in to continue your seller setup layout flows.
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
            placeholder="merchant@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {isLoading ? "Authenticating Session..." : "Secure Sign In"}
            </span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-sm text-text-tertiary text-center">
          Need an account?{" "}
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
