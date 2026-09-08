"use client";

import { Clock, ShieldAlert, Store, Package, ShoppingBag } from "lucide-react";
import { useOrgContext } from "@/features/team";
import { isSellerRejected } from "@/shared/lib/sellerVerification";

/**
 * Where a seller waits while an administrator reviews their registration.
 *
 * Rendered inside the seller shell rather than as a standalone page, so the
 * sidebar stays visible with its items locked. Seeing the tools they are waiting
 * for — greyed out, with a reason — reads as "not yet", which is the truth. A
 * bare page with no navigation reads as being signed out of the wrong account.
 *
 * Deliberately not styled as an error. Nothing has gone wrong: this is the
 * normal first state of every new seller account.
 */
export default function SellerPendingPage() {
  const orgQuery = useOrgContext();
  const rejected = isSellerRejected(orgQuery.data?.sellerStatus);

  const Icon = rejected ? ShieldAlert : Clock;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
          rejected
            ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
            : "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {rejected ? "Application not approved" : "Account under review"}
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        {rejected
          ? "Your seller application was reviewed and not approved. Contact support if you believe this was a mistake, or to ask what would need to change."
          : "Your seller account is currently being reviewed by an administrator. You will be able to access seller features once your account has been verified."}
      </p>

      {!rejected && (
        <>
          <div className="mt-10 w-full rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Available once verified
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Store, label: "Create and manage your store" },
                { icon: Package, label: "List products and track stock" },
                { icon: ShoppingBag, label: "Receive and process orders" },
              ].map(({ icon: ItemIcon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                >
                  <ItemIcon className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-xs text-[var(--text-tertiary)]">
            There is nothing for you to submit — an administrator reviews new
            seller accounts directly. This page updates on its own once yours is
            approved.
          </p>
        </>
      )}
    </div>
  );
}
