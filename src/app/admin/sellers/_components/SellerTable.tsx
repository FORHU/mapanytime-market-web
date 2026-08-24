"use client";

import { PendingSeller } from "@/features/adminSellers/contracts/seller.contract";
import { Button } from "@/shared/components/ui/Button";
import { formatDistanceToNow } from "date-fns";

interface SellerTableProps {
  sellers: PendingSeller[];
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export default function SellerTable({
  sellers,
  onView,
  onApprove,
  onReject,
  isLoading = false,
}: SellerTableProps) {
  if (sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-tertiary)]">
          No pending sellers to review
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-default)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-secondary)] border-b border-[var(--border-light)]">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">Name</th>
            <th className="px-6 py-3 text-left font-semibold">Email</th>
            <th className="px-6 py-3 text-left font-semibold">Phone</th>
            <th className="px-6 py-3 text-left font-semibold">Stores</th>
            <th className="px-6 py-3 text-left font-semibold">Verifications</th>
            <th className="px-6 py-3 text-left font-semibold">Applied</th>
            <th className="px-6 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-light)]">
          {sellers.map((seller) => (
            <tr key={seller.id}>
              <td className="px-6 py-3">
                <div className="font-medium">
                  {[seller.firstName, seller.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </div>
              </td>
              <td className="px-6 py-3 text-[var(--text-secondary)]">
                {seller.email}
              </td>
              <td className="px-6 py-3 text-[var(--text-secondary)]">
                {seller.phoneNumber || "-"}
              </td>
              <td className="px-6 py-3 text-center">{seller.storeCount}</td>
              <td className="px-6 py-3 text-center">
                {seller.verificationCount}
              </td>
              <td className="px-6 py-3 text-[var(--text-secondary)]">
                {formatDistanceToNow(new Date(seller.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-6 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => onView(seller.id)}
                    disabled={isLoading}
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => onApprove(seller.id)}
                    disabled={isLoading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ color: "var(--md-sys-color-error)" }}
                    onClick={() => onReject(seller.id)}
                    disabled={isLoading}
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
