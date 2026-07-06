"use client";

import React, { useState } from "react";
import RegisterWorkflow from "@/features/auth/components/RegisterWorkflow";
import StoreOnboardingForm from "@/features/auth/components/StoreOnboardingForm";
import { useRouter } from "next/navigation";

type PagePhase = "REGISTRATION" | "STORE_ONBOARDING";

export default function RegisterEntryRoot() {
  const [phase, setPhase] = useState<PagePhase>("REGISTRATION");
  const router = useRouter();

  const handleRegisterSuccess = () => {
    setPhase("STORE_ONBOARDING");
  };

  const handleOnboardSuccess = () => {
    // Successfully onboarded merchant -> Route directly into the app dashboard space
    router.push("/seller/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors"
      style={{ backgroundColor: "var(--background-secondary)" }}
    >
      {phase === "REGISTRATION" ? (
        <RegisterWorkflow onCompleteSeller={handleRegisterSuccess} />
      ) : (
        <StoreOnboardingForm onComplete={handleOnboardSuccess} />
      )}
    </div>
  );
}
