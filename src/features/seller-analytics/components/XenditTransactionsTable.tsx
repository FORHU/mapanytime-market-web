import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { formatPeso } from "@/shared/lib/currency";
import { SectionHeading } from "./SectionHeading";
import type {
  PaymentStatus,
  XenditPaymentMethod,
  XenditTransaction,
} from "../contracts/seller-analytics.contract";

interface XenditTransactionsTableProps {
  transactions: XenditTransaction[];
}

/**
 * The API's `PAYMENTSTATUS` values, mapped to what a seller should read and to
 * the four tones `StatusPill` provides. Keeping the enum in the data and the
 * wording here means the copy can change without touching the fixture.
 */
const STATUS_DISPLAY: Record<
  PaymentStatus,
  { label: string; variant: "success" | "warning" | "error" | "info" }
> = {
  COMPLETED: { label: "Paid", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  FAILED: { label: "Failed", variant: "error" },
  REFUNDED: { label: "Refunded", variant: "info" },
};

const METHOD_LABELS: Record<XenditPaymentMethod, string> = {
  GCASH: "GCash",
  MAYA: "Maya",
};

/** Matches the portal convention, e.g. `SellerOrdersBoard.tsx:321`. */
function shortRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function formatTransactedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function XenditTransactionsTable({
  transactions,
}: XenditTransactionsTableProps) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Recent transactions"
        description="The latest payments Xendit processed for this store."
      />

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-default)] p-12 text-center text-sm text-[var(--text-secondary)]">
          No online payments in this period yet.
        </div>
      ) : (
        // `!p-0` beats Card's own `p-4` so the table meets the card edge.
        // Card already applies overflow-hidden.
        <Card className="!p-0">
          <div className="w-full overflow-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--background-secondary)] text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  <th scope="col" className="py-3.5 px-4 w-[20%]">
                    Transaction
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-[18%]">
                    Order
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-right w-[18%]">
                    Amount
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-[16%]">
                    Method
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-[16%]">
                    Date
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-[12%]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-light)]">
                {transactions.map((txn) => {
                  const status = STATUS_DISPLAY[txn.status];
                  return (
                    <tr
                      key={txn.id}
                      className="transition-colors hover:bg-[var(--background-secondary)]/20"
                    >
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-[var(--text-primary)] truncate">
                        #{shortRef(txn.id)}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-[var(--text-secondary)] truncate">
                        #{shortRef(txn.orderId)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)] tabular-nums truncate">
                        {formatPeso(txn.amount)}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                        {METHOD_LABELS[txn.method]}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)] truncate">
                        {formatTransactedAt(txn.transactedAt)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusPill
                          label={status.label}
                          variant={status.variant}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
