import React from "react";
import { ConfigurationList } from "@/features/adminPricing/components/ConfigurationList";

export const metadata = {
  title: "Pricing Engine | Admin Console",
  description: "Manage platform pricing configurations, rules, and rate cards.",
};

export default function AdminPricingPage() {
  return <ConfigurationList />;
}
