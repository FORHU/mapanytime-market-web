"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch(
        "http://192.168.1.176:3002/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            password,
            roleName: "SELLER", // ◄ Perfectly matches your Joi string requirement
          }),
        },
      );

      const dbData = await response.json();

      if (!response.ok) {
        throw new Error(dbData?.message || `Server Error: ${response.status}`);
      }

      // ── 🔒 NEW AUTOMATED SELLER PATH ACCELERATOR ──
      // Captures the updated 'data' payload returned by your backend change
      const token = dbData?.data?.accessToken || dbData?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", "seller");
        alert(
          "Registration successful! Authorized token captured. Proceeding straight to onboarding.",
        );
        router.push("/seller/onboarding");
      } else {
        alert("Account generated! Proceeding to the merchant login portal.");
        router.push("/login");
      }
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
          className="w-full border p-3 rounded-xl text-xs font-bold"
          required
        />
        <input
          type="email"
          placeholder="Merchant Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl text-xs font-bold"
          required
        />
        <input
          type="password"
          placeholder="Password (Min 6 Characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl text-xs font-bold"
          required
        />

        <button
          type="submit"
          className="w-full py-3.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
        >
          Create Merchant Account
        </button>
      </form>
    </div>
  );
}
