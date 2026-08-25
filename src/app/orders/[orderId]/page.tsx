"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  useOrderResult,
  resolveOutcome,
  type Outcome,
} from "@/features/orderResult/hooks/useOrderResult";
import { ReturnStatusSchema } from "@/features/orderResult/contracts/orderResult.contract";

const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);

const COPY: Record<
  Outcome,
  { title: string; body: string; icon: typeof CheckCircle2; tone: string }
> = {
  paid: {
    title: "Payment confirmed",
    body: "Your order is being prepared. You'll get a pickup pass when it's ready to collect.",
    icon: CheckCircle2,
    tone: "text-emerald-400",
  },
  waiting: {
    title: "Confirming your payment",
    body: "Your bank or e-wallet is still telling us about this payment. It usually takes a few seconds — this page updates itself, so there's no need to pay again.",
    icon: Clock,
    tone: "text-amber-400",
  },
  cancelled: {
    title: "Payment cancelled",
    body: "Nothing was charged. Your items are still in your cart if you'd like to try again.",
    icon: XCircle,
    tone: "text-[var(--text-secondary)]",
  },
  failed: {
    title: "Payment failed",
    body: "The gateway couldn't complete this payment. Nothing was charged — you can try a different method.",
    icon: AlertTriangle,
    tone: "text-rose-400",
  },
};

export default function OrderResultPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();

  // Whatever the gateway appended. Parsed permissively — `.catch("success")`
  // means an unknown value degrades to the neutral path rather than throwing
  // at a buyer who has just handed over money.
  const returned = ReturnStatusSchema.parse(
    searchParams.get("status") ?? "success",
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrderResult(orderId);

  const outcome = resolveOutcome(returned, data?.paymentStatus);
  const copy = COPY[outcome];
  const Icon = copy.icon;

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Icon className={`h-12 w-12 ${copy.tone}`} aria-hidden />
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {copy.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {copy.body}
          </p>
        </div>

        {isError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-2">
            <p className="text-sm text-rose-300">
              We couldn&apos;t read this order&apos;s status.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {error instanceof Error
                ? error.message
                : "Please try again in a moment."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Try again
            </button>
          </div>
        )}

        {data && (
          <dl className="space-y-2 border-t border-[var(--border-default)] pt-5 text-sm">
            <Row label="Order" value={data.orderId} mono />
            <Row label="Amount" value={peso(data.amount)} />
            <Row label="Paid with" value={data.paymentMethod} />
            <Row label="Provider" value={data.provider} />
            {data.paidAt && (
              <Row
                label="Paid at"
                value={new Date(data.paidAt).toLocaleString("en-PH")}
              />
            )}
          </dl>
        )}

        {isLoading && (
          <p className="text-center text-xs text-[var(--text-tertiary)]">
            Checking with the payment provider…
          </p>
        )}

        {outcome === "waiting" && isFetching && !isLoading && (
          <p
            className="text-center text-xs text-[var(--text-tertiary)]"
            aria-live="polite"
          >
            Still checking…
          </p>
        )}

        {/*
          No "View my orders" link: the web app has no buyer order list. There
          is a seller and an admin one, and the Flutter app has a buyer view,
          but nothing here — so offering it would send the buyer to a page that
          cannot show them their order. Keep the order id above instead, which
          is the thing they would quote to support.
        */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/"
            className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-3 text-center text-sm font-medium text-[var(--background-primary)] transition hover:opacity-90"
          >
            Keep shopping
          </Link>
          <Link
            href="/buyer"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to the map
          </Link>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[var(--text-tertiary)]">{label}</dt>
      <dd
        className={`text-right text-[var(--text-primary)] ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
