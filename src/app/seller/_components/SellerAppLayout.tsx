"use client";

import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { SellerAuthGate } from "@/features/auth/components/SellerAuthGate";
import { StoreSelectorDropdown } from "@/features/stores/components/StoreSelectorDropdown";

export function SellerAppLayout({ children }: { children: React.ReactNode }) {
  const { data: stores, isLoading } = useStoreProfiles();

  return (
    <SellerAuthGate
      stores={stores}
      storeSelector={
        <StoreSelectorDropdown stores={stores} isLoading={isLoading} />
      }
    >
      {children}
    </SellerAuthGate>
  );
}
