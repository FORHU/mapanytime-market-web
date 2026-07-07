import { SellerLayout } from "@/shared/components/layout/SellerLayout";

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerLayout>{children}</SellerLayout>;
}
