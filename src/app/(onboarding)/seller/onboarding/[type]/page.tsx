"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import HouseLotOnboardingStub from "@/features/stores/components/HouseLotOnboardingStub";
import RentingOnboardingStub from "@/features/stores/components/RentingOnboardingStub";
import StoreOnboardingForm from "@/features/stores/components/StoreOnboardingForm";
import { STORE_TYPE_SLUGS, type StoreType } from "@/features/stores/types";

interface SellerOnboardingTypePageProps {
  params: Promise<{ type: string }>;
}

export default function SellerOnboardingTypePage({
  params,
}: SellerOnboardingTypePageProps) {
  const router = useRouter();
  const { type } = use(params);
  const isValidType = STORE_TYPE_SLUGS.includes(type as StoreType);

  useEffect(() => {
    if (!isValidType) router.replace("/seller/manage-stores");
  }, [isValidType, router]);

  if (!isValidType) return null;

  const storeType = type as StoreType;

  if (storeType === "house-lot") {
    return (
      <HouseLotOnboardingStub
        onBack={() => router.push("/seller/manage-stores")}
      />
    );
  }

  if (storeType === "renting") {
    return (
      <RentingOnboardingStub
        onBack={() => router.push("/seller/manage-stores")}
      />
    );
  }

  return (
    <StoreOnboardingForm
      storeType={storeType}
      onBack={() => router.push("/seller/manage-stores")}
      onComplete={() => router.push("/seller/manage-stores")}
    />
  );
}
