"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCreateProperty } from "@/features/properties/hooks/useCreateProperty";
import { STORE_TYPE_SLUGS, type StoreType } from "@/features/stores/types";

/**
 * This route renders exactly ONE of these three forms, chosen from a URL
 * segment, but statically importing all three meant every visitor downloaded
 * all three — and each one reaches MapSelection, so the route carried the map
 * engine as well. Loading them on demand means a visitor pays only for the form
 * they actually opened.
 *
 * `ssr: false` because all three are client-only form components that read from
 * localStorage for draft restore on mount.
 */
const loadingFallback = () => (
  <div className="mx-auto w-full max-w-4xl p-6">
    <div className="h-8 w-56 animate-pulse rounded bg-[var(--background-secondary)]" />
    <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-[var(--background-secondary)]" />
  </div>
);

const HouseLotOnboardingStub = dynamic(
  () => import("@/features/stores/components/HouseLotOnboardingStub"),
  { ssr: false, loading: loadingFallback },
);
const RentingOnboardingStub = dynamic(
  () => import("@/features/stores/components/RentingOnboardingStub"),
  { ssr: false, loading: loadingFallback },
);
const StoreOnboardingForm = dynamic(
  () => import("@/features/stores/components/StoreOnboardingForm"),
  { ssr: false, loading: loadingFallback },
);

interface SellerOnboardingTypePageProps {
  params: Promise<{ type: string }>;
}

function HouseLotOnboardingRoute({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const propertyMutation = useCreateProperty({
    onSuccess: () => setSubmitted(true),
  });

  return (
    <HouseLotOnboardingStub
      onBack={onBack}
      onSubmit={(draft) => propertyMutation.mutate(draft)}
      isSubmitting={propertyMutation.isPending}
      submitted={submitted}
    />
  );
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
      <HouseLotOnboardingRoute
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
