"use client";

import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { StoreProfileSettings } from "@/features/store-profile/components/StoreProfileSettings";

export default function StoreProfilePage() {
  const { activeStoreId, isHydrated } = useActiveStore();

  return (
    <StoreProfileSettings
      activeStoreId={activeStoreId}
      isHydrated={isHydrated}
    />
  );
}
