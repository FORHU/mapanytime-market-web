"use client";

import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { SellerAuthGate } from "@/features/auth/components/SellerAuthGate";

export function SellerAppLayout({ children }: { children: React.ReactNode }) {
  const { data: stores } = useStoreProfiles();

  return <SellerAuthGate stores={stores}>{children}</SellerAuthGate>;
}
