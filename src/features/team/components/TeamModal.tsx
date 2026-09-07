"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function TeamModal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  maxWidth = "max-w-lg",
}: TeamModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-xl p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]"
        >
          <XIcon className="h-5 w-5" />
        </button>

        <div className="pr-10 text-left">
          {eyebrow && (
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-core)]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
        </div>

        <div className="mt-5 text-left">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
