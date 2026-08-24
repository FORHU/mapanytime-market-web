"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { X } from "lucide-react";

interface RejectionModalProps {
  onSubmit: (reason: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function RejectionModal({
  onSubmit,
  onClose,
  isLoading = false,
}: RejectionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    if (reason.length < 3) {
      setError("Reason must be at least 3 characters");
      return;
    }

    if (reason.length > 1000) {
      setError("Reason must be at most 1000 characters");
      return;
    }

    try {
      await onSubmit(reason);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject seller");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Reject Seller
          </h2>
          <button
            onClick={onClose}
            aria-label="Close rejection dialog"
            disabled={isLoading}
            className="rounded-xl p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Explain why you're rejecting this seller..."
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-transparent focus:outline-none focus:border-[var(--brand-core)] transition-colors resize-none text-[var(--text-primary)]"
              rows={5}
              disabled={isLoading}
            />
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              {reason.length}/1000 characters
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border-default)]">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              style={{
                backgroundColor: "var(--md-sys-color-error)",
                color: "#ffffff",
              }}
            >
              {isLoading ? "Rejecting..." : "Reject Seller"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
