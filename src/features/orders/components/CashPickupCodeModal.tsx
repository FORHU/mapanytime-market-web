"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { X, RefreshCw, AlertCircle } from "lucide-react";

interface CashPickupCodeModalProps {
  orderId: string;
  storeId: string;
  onClose: () => void;
  onGenerate: (
    orderId: string,
    storeId: string,
  ) => Promise<{ code: string; expiresInSeconds: number }>;
}

/**
 * Cash on Pickup only: the seller shows this instead of tapping "Complete
 * pickup" directly. Completion now waits on the buyer scanning this code in
 * their app — proof cash actually changed hands, rather than the seller's
 * own say-so. See OrderService.generateCashPickupCode / confirmCashPickup.
 */
export function CashPickupCodeModal({
  orderId,
  storeId,
  onClose,
  onGenerate,
}: CashPickupCodeModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onGenerate(orderId, storeId);
      setCode(result.code);
      setSecondsLeft(result.expiresInSeconds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't generate a code.",
      );
      setCode(null);
    } finally {
      setIsLoading(false);
    }
  }, [onGenerate, orderId, storeId]);

  useEffect(() => {
    generate();
    // Only on mount — regeneration afterward is a deliberate button press.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!code || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [code, secondsLeft]);

  const expired = code !== null && secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="border border-[var(--border-default)] max-w-sm w-full p-6 shadow-2xl space-y-5 bg-[var(--background-primary)] relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 pt-1">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Cash Pickup Confirmation
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <p className="text-xs text-[var(--text-secondary)] text-center leading-relaxed">
          Once you&apos;ve received cash from the buyer, show this to them —
          they scan it in their app to confirm the order themselves. It replaces
          tapping &ldquo;Complete pickup&rdquo; for cash orders.
        </p>

        <div className="flex flex-col items-center gap-3 py-2">
          {isLoading ? (
            <div className="w-[180px] h-[180px] rounded-xl bg-[var(--background-secondary)] animate-pulse" />
          ) : error ? (
            <div className="w-[180px] h-[180px] rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col items-center justify-center gap-2 text-center px-3">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          ) : code ? (
            <div
              className={`p-3 rounded-xl bg-white ${expired ? "opacity-30" : ""}`}
            >
              <QRCodeSVG
                value={`MAPANYTIME-CASH-CONFIRM:${orderId}:${code}`}
                size={180}
              />
            </div>
          ) : null}

          {code && !error && (
            <>
              <p className="font-mono text-lg font-extrabold tracking-[0.2em] text-[var(--text-primary)]">
                {code}
              </p>
              <p
                className={`text-xs font-medium ${expired ? "text-rose-600" : "text-[var(--text-secondary)]"}`}
              >
                {expired
                  ? "Code expired — generate a new one"
                  : `Expires in ${minutes}:${seconds.toString().padStart(2, "0")}`}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="!w-auto !text-sm !px-4 !rounded-xl"
          >
            Close
          </Button>
          {(expired || error) && (
            <Button
              onClick={generate}
              isLoading={isLoading}
              className="!w-auto !text-sm !px-4 !rounded-xl inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New code</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default CashPickupCodeModal;
