"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import { CustomButton, FormField, useNotification } from "@/shared/components";
import { login as apiLogin } from "@/features/auth/api/auth.api";

export default function UnifiedSignInPage() {
  const router = useRouter();
  const showNotification = useNotification();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dbData = await apiLogin(email, password);
      const sessionToken = dbData?.data?.accessToken;

      if (!sessionToken) {
        throw new Error(
          "Handshake succeeded, but data.accessToken layer is missing.",
        );
      }

      sessionStorage.setItem("token", sessionToken);
      sessionStorage.setItem("userRole", "seller");

      showNotification(
        "Authentication Success! Loading your Store Onboarding portal view.",
        "success",
      );

      router.push("/seller/onboarding");
    } catch (err: any) {
      console.error(err);
      showNotification(
        err.message || "Authentication pipeline cluster down.",
        "error",
      );
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            type="email"
            placeholder="merchant@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormField
            type="password" // 🟢 SECURE: Obfuscated password input field renders cleanly now!
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <CustomButton
            type="submit"
            loading={isLoading}
            fullWidth
            className="bg-gradient-to-r from-brand-core to-brand-vibrant py-3.5"
          >
            <span>
              {isLoading ? "Authenticating Session..." : "Secure Sign In"}
            </span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </CustomButton>
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
