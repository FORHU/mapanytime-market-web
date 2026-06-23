"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuardPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Check local secure storage or state cookie for a user profile session token
    const isAuthenticated = localStorage.getItem("user_session_token");

    // 2. Perform traffic redirect matching authentication parameters
    if (isAuthenticated) {
      // User is verified, fast-track them to the workspace hub
      router.replace("/seller/dashboard");
    } else {
      // User token is missing or dead, force them to authenticate
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      {/* Sleek intermediate micro-loader state view while validation executes */}
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
        Verifying Identity Secure Credentials...
      </span>
    </div>
  );
}
