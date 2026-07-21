"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import { Card } from "@/shared/components/ui/Card";
import { Smartphone } from "lucide-react";

type LoginRole = "buyer" | "seller";

export default function LoginPage() {
  const router = useRouter();
  const [buyerLoggedIn, setBuyerLoggedIn] = useState(false);

  const handleLoginSuccess = (role: LoginRole, hasStores: boolean) => {
    if (role === "seller") {
      router.push(hasStores ? "/seller/manage-stores" : "/seller/onboarding");
      return;
    }
    setBuyerLoggedIn(true);
  };

  if (buyerLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
        <Card className="p-6 text-center space-y-4 py-8 max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black">Download MapAnytime Mobile</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
              You&apos;re signed in! To browse store pins and check out locally,
              use our native mobile companion app.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#app-store"
              className="w-full py-2 text-center text-xs font-bold border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900"
              style={{ borderColor: "var(--border-light)" }}
            >
              Download on iOS App Store
            </a>
            <a
              href="#google-play"
              className="w-full py-2 text-center text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90"
            >
              Get it on Google Play
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
      <div className="text-center space-y-1 mb-6">
        <div className="text-xl font-black tracking-tight">
          Map<span className="text-[var(--brand-core)]">Central</span>
        </div>
      </div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
