import { SellerAnalyticsWorkspace } from "@/features/seller-analytics/components/SellerAnalyticsWorkspace";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Sales reports
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          See how your store is doing over time.
        </p>
      </div>

      <SellerAnalyticsWorkspace />
    </div>
  );
}
