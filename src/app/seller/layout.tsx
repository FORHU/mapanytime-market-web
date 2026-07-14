import { SellerAuthGate } from "@/features/auth/components/SellerAuthGate";

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerAuthGate>{children}</SellerAuthGate>;
}
