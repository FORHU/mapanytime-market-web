"use client";

import React from "react";
import LoginForm from "@/features/auth/components/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginEntryRoot() {
  const router = useRouter();

  const handleLoginSuccess = (role: string) => {
    // Session token is successfully saved backend side, evaluate role paths:
    if (role === "seller") {
      router.push("/seller/dashboard");
    } else {
      // Future buyer fallback pathing route
      router.push("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors px-4"
      style={{ backgroundColor: "var(--background-secondary)" }}
    >
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
