import React from "react";
import { ConfigurationDetail } from "@/features/adminPricing/components/ConfigurationDetail";

export const metadata = {
  title: "Pricing Configuration | Admin Console",
};

export default async function AdminPricingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConfigurationDetail id={id} />;
}
