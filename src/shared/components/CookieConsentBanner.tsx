"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  getConsent,
  setConsent,
  hasConsent,
} from "@/shared/lib/cookie-consent";

/**
 * GDPR-style consent banner shown until the visitor Accepts or Rejects.
 *
 * No analytics are loaded yet — the consent cookie set here is the foundation
 * that future tracking scripts should be gated behind: only load them when
 * getConsent() === "accepted".
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (choice: "accepted" | "rejected") => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie settings"
      className="fixed inset-x-0 bottom-0 z-[9998] border-t border-[var(--border-light)] bg-[var(--background-elevated)] p-4 shadow-2xl md:p-5"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-[var(--text-secondary)]">
            <Cookie className="h-4 w-4" />
          </div>
          <p className="text-sm leading-5 text-[var(--text-secondary)]">
            We use cookies to keep the site working and remember your
            preferences. No analytics or tracking cookies are loaded yet, but if
            we add them in the future they will only run with your consent.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 md:ml-auto">
          <Button variant="secondary" onClick={() => choose("rejected")}>
            Reject all
          </Button>
          <Button onClick={() => choose("accepted")}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}
