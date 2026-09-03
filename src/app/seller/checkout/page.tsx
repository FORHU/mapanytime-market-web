import { Card, CardContent } from "@/shared/components/ui/Card";
import { QrCode } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Payment links
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Let customers pay by scanning a QR code at your stall.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--background-tertiary)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <QrCode className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Payment links are coming soon
          </p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            You&apos;ll be able to print a QR code customers can scan to buy
            from you on the spot.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
