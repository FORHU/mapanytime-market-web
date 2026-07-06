// src/app/seller/layout.tsx
import { SellerLayout } from "@/shared/components/layout/SellerLayout";

export default function RootMerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerLayout>{children}</SellerLayout>;
}
