"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getConsent, setConsent } from "@/shared/lib/cookie-consent";

interface CookieSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Minimal dialog for changing the consent choice from the footer's
 * "Cookie Settings" button (previously a TODO stub).
 */
export function CookieSettingsDialog({
  open,
  onClose,
}: CookieSettingsDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const current = getConsent();

  const choose = (choice: "accepted" | "rejected") => {
    setConsent(choice);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
      >
        <h2
          id="cookie-settings-title"
          className="text-lg font-black tracking-tight text-[var(--text-primary)] md:text-xl"
        >
          Cookie Settings
        </h2>
        <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
          {current === "accepted"
            ? "You currently accept all cookies."
            : current === "rejected"
              ? "You currently reject all cookies."
              : "You have not made a choice yet."}{" "}
          No analytics or tracking cookies are loaded today — if they are added
          later, they will only run with your consent.
        </p>

        <div className="mt-7 flex gap-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--border-default)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="flex-1 rounded-full border border-[var(--border-default)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="flex-1 rounded-full bg-[var(--brand-core)] py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
