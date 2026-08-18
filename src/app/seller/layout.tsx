import { SellerAppLayout } from "./_components/SellerAppLayout";

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerAppLayout>{children}</SellerAppLayout>;
}
