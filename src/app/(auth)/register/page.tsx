"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/features/auth/api/auth.api";

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNextStepAction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiRegister(fullName, email, password);

      // ── 🔒 ENFORCED SECURITY GATE: REGISTRATION CLEARANCE ONLY ──
      // Clean out any stale/previous JWT local tracking data to secure the next login pass
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("latest_onboarded_store");

      alert(
        "Account generated successfully! Redirecting to the merchant login portal.",
      );

      // Strict routing push to your login verification page
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      alert(`Registration System Alert: ${err.message}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Create Merchant Account
        </h1>
        <p className="text-xs text-slate-400">
          Sign up below to test your live backend service workflows layer.
        </p>
      </div>

      <form onSubmit={handleNextStepAction} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-3 rounded-xl text-xs font-bold bg-white focus:outline-hidden"
          required
        />
        <input
          type="email"
          placeholder="Merchant Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl text-xs font-bold bg-white focus:outline-hidden"
          required
        />
        <input
          type="password"
          placeholder="Password (Min 6 Characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl text-xs font-bold bg-white focus:outline-hidden"
          required
        />

        <button
          type="submit"
          className="w-full py-3.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
        >
          Create Merchant Account
        </button>
      </form>
    </div>
  );
}
