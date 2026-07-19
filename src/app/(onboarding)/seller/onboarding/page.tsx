"use client";

import React from "react";
import { useRouter } from "next/navigation";
import StoreOnboardingForm from "@/features/stores/components/StoreOnboardingForm";

export default function SellerOnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/seller/manage-stores");
  };

  return <StoreOnboardingForm onComplete={handleComplete} />;
}
