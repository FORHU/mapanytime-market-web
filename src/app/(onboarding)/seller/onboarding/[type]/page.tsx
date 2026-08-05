"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <StoreOnboardingForm
      storeType={storeType}
      onComplete={() => router.push("/seller/manage-stores")}
    />
  );
}
