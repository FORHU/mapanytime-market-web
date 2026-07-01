"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import { CustomButton, FormField, useNotification } from "@/shared/components";
import { register as apiRegister } from "@/features/auth/api/auth.api";

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const showNotification = useNotification();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNextStepAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRegister(fullName, email, password);

      // 🟢 CLEANUP: Purge old credential fragments out of sessionStorage upon fresh generation
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("latest_onboarded_store");

      showNotification(
        "Account generated successfully! Redirecting to the merchant login portal.",
        "success",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showNotification(`Registration System Alert: ${err.message}`, "error");
      setLoading(false); // ◄ Turn off loading spinner state on failure parameters
    }
  };

  if (!mounted) return null;

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            Create Merchant Account
          </h1>
          <p className="text-xs text-slate-400">
            Sign up below to test your live backend service workflows layer.
          </p>
        </div>

        <form onSubmit={handleNextStepAction} className="space-y-4">
          <FormField
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <FormField
            type="email"
            placeholder="Merchant Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormField
            type="password"
            placeholder="Password (Min 6 Characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <CustomButton
            type="submit"
            loading={loading}
            fullWidth
            className="!bg-slate-900 hover:!bg-slate-800 text-white py-3"
          >
            Create Merchant Account
          </CustomButton>
        </form>
      </div>
    </AuthLayout>
  );
}
