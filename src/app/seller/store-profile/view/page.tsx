"use client";

import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { StoreProfileView } from "@/features/store-profile/components/StoreProfileView";

export default function StoreProfileViewPage() {
  const { activeStoreId, isHydrated } = useActiveStore();

  return (
    <StoreProfileView activeStoreId={activeStoreId} isHydrated={isHydrated} />
  );
}
