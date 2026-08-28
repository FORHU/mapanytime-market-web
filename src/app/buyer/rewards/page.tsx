"use client";

import { useState } from "react";
import { Tag, Ticket, History as HistoryIcon } from "lucide-react";
import { WalletSummary } from "@/features/rewards/components/WalletSummary";
import { VoucherCard } from "@/features/rewards/components/VoucherCard";
import { MyVoucherCard } from "@/features/rewards/components/MyVoucherCard";
import { TransactionList } from "@/features/rewards/components/TransactionList";
import {
  useWallet,
  useVoucherCatalog,
  useMyVouchers,
  useClaimVoucher,
} from "@/features/rewards/hooks/useRewards";

type Tab = "catalog" | "myVouchers" | "history";

const tabs: { id: Tab; label: string; icon: typeof Tag }[] = [
  { id: "catalog", label: "Catalog", icon: Tag },
  { id: "myVouchers", label: "My Vouchers", icon: Ticket },
  { id: "history", label: "History", icon: HistoryIcon },
];

function CatalogTab() {
  const { data: wallet } = useWallet();
  const { data: vouchers, isLoading, isError } = useVoucherCatalog();
  const claim = useClaimVoucher();
  const balance = wallet?.balance ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Couldn&apos;t load the voucher catalog.
      </p>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        No vouchers available right now.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {vouchers.map((voucher) => (
        <VoucherCard
          key={voucher.id}
          voucher={voucher}
          pointsBalance={balance}
          isClaiming={claim.isPending && claim.variables === voucher.id}
          onClaim={() => claim.mutate(voucher.id)}
        />
      ))}
    </div>
  );
}

function MyVouchersTab() {
  const { data: vouchers, isLoading, isError } = useMyVouchers();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Couldn&apos;t load your vouchers.
      </p>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        You haven&apos;t claimed any vouchers yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {vouchers.map((uv) => (
        <MyVoucherCard key={uv.id} userVoucher={uv} />
      ))}
    </div>
  );
}

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("catalog");

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          MapPoints
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Earn points on every purchase, spend them on vouchers.
        </p>
      </div>

      <WalletSummary />

      <div className="flex gap-1 p-1 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-default)]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === id
                ? "bg-[var(--brand-core)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "catalog" && <CatalogTab />}
      {tab === "myVouchers" && <MyVouchersTab />}
      {tab === "history" && <TransactionList />}
    </div>
  );
}
