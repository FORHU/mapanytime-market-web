"use client";

import React from "react";
import Link from "next/link";
import {
  usePricingConfiguration,
  usePricingActions,
} from "../hooks/usePricing";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  AlertTriangle,
  AlertCircle,
  Archive,
} from "lucide-react";

export function ConfigurationDetail({ id }: { id: string }) {
  const {
    data: config,
    isLoading,
    isError,
    error,
    refetch,
  } = usePricingConfiguration(id);
  const { activate, archive } = usePricingActions();

  const handleActivate = async () => {
    if (
      !confirm(
        "Are you sure you want to activate this configuration? This will archive the currently active configuration and apply these rates to all future orders immediately.",
      )
    ) {
      return;
    }
    activate.mutate(id);
  };

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this configuration? Its rules will no longer apply to new orders.",
      )
    ) {
      return;
    }
    archive.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)]">
        <div className="inline-flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading pricing configuration...</span>
        </div>
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="p-12 text-center text-rose-500 space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="font-semibold">
          {error?.message || "Configuration not found."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--background-secondary)] text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-colors border border-[var(--border-default)]"
          >
            Retry
          </button>
          <Link
            href="/admin/pricing"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  const components = config.components || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm font-medium text-[var(--text-secondary)]">
        <Link
          href="/admin/pricing"
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pricing Engine
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            {config.name}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                config.status === "ACTIVE"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : config.status === "DRAFT"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
              }`}
            >
              {config.status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {components.length} total active rules.
            {config.status === "ACTIVE" &&
              " This configuration is currently live."}
            {config.description && ` — ${config.description}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {config.status === "DRAFT" && (
            <button
              onClick={handleActivate}
              disabled={activate.isPending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {activate.isPending
                ? "Activating..."
                : "Set as Active Configuration"}
            </button>
          )}
          {config.status === "ACTIVE" && (
            <button
              onClick={handleArchive}
              disabled={archive.isPending}
              className="flex items-center gap-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-default)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-400/30 transition-colors disabled:opacity-50"
            >
              <Archive className="h-3.5 w-3.5" />
              {archive.isPending ? "Archiving..." : "Archive Policy"}
            </button>
          )}
        </div>
      </div>

      {config.status === "ACTIVE" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-300">
            <strong className="text-emerald-200">
              Active Platform Rate Card
            </strong>
            <p className="mt-1 text-xs text-emerald-300/90 leading-relaxed">
              This pricing configuration is actively pricing all incoming orders
              and checkout carts across the marketplace.
            </p>
          </div>
        </div>
      )}

      {config.status === "ARCHIVED" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-300">
            <strong className="text-amber-200">Archived Configuration</strong>
            <p className="mt-1 text-xs text-amber-300/90 leading-relaxed">
              This configuration is archived. Its rules are preserved for audit
              and historical reporting, but no longer apply to new orders.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] shadow-sm overflow-hidden mt-6">
        <div className="border-b border-[var(--border-light)] bg-[var(--background-tertiary)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[var(--text-primary)]">
            Pricing Rules ({components.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--background-tertiary)]/50 text-[var(--text-tertiary)] uppercase text-xs border-b border-[var(--border-light)]">
              <tr>
                <th className="px-6 py-3 font-semibold">Rule Type</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold text-right">
                  Calculation
                </th>
                <th className="px-6 py-3 font-semibold text-right">
                  Rate / Fee
                </th>
                <th className="px-6 py-3 font-semibold text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {components.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[var(--text-secondary)]"
                  >
                    No pricing components configured in this policy.
                  </td>
                </tr>
              ) : (
                components.map((c) => {
                  const rateVal = c.ratePercentage ?? c.rate;
                  const hasPercentage =
                    c.calculationType.includes("PERCENTAGE") ||
                    c.calculationType === "HYBRID" ||
                    (rateVal !== null && rateVal !== undefined && rateVal > 0);
                  const hasFixed =
                    c.calculationType.includes("FIXED") ||
                    c.calculationType === "HYBRID" ||
                    (c.fixedAmount !== null &&
                      c.fixedAmount !== undefined &&
                      c.fixedAmount > 0);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--background-tertiary)]/40 transition-colors"
                    >
                      <td className="px-6 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {c.type.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-3 text-[var(--text-secondary)] max-w-xs truncate">
                        {c.description || "—"}
                      </td>
                      <td className="px-6 py-3 text-[var(--text-secondary)] text-right font-mono text-xs">
                        {c.calculationType}
                      </td>
                      <td className="px-6 py-3 font-bold text-right text-[var(--text-primary)] whitespace-nowrap">
                        {hasPercentage &&
                          rateVal !== null &&
                          rateVal !== undefined && (
                            <span>{(rateVal * 100).toFixed(2)}%</span>
                          )}
                        {hasPercentage && hasFixed && " + "}
                        {hasFixed &&
                          c.fixedAmount !== null &&
                          c.fixedAmount !== undefined && (
                            <span>₱{c.fixedAmount.toFixed(2)}</span>
                          )}
                        {!hasPercentage && !hasFixed && "—"}
                      </td>
                      <td className="px-6 py-3 text-right text-xs">
                        {c.categoryId && (
                          <span className="bg-[var(--background-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] border border-[var(--border-light)]">
                            Category
                          </span>
                        )}
                        {c.providerId && (
                          <span className="bg-[var(--background-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] border border-[var(--border-light)] ml-1">
                            {c.provider?.name || c.provider?.code || "Provider"}
                          </span>
                        )}
                        {c.methodCode && (
                          <span className="bg-[var(--background-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] border border-[var(--border-light)] ml-1">
                            {c.paymentMethod?.name || c.methodCode}
                          </span>
                        )}
                        {!c.categoryId && !c.providerId && !c.methodCode && (
                          <span className="text-[var(--text-tertiary)]">
                            Global
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
