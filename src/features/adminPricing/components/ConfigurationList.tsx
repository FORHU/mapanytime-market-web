"use client";

import React from "react";
import Link from "next/link";
import { usePricingConfigurations } from "../hooks/usePricing";
import { Settings, ChevronRight, Calculator, AlertCircle } from "lucide-react";

export function ConfigurationList() {
  const {
    data: configs,
    isLoading,
    isError,
    error,
    refetch,
  } = usePricingConfigurations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Pricing Engine
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage platform financial rules, commissions, and gateway fee
            policies.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--background-tertiary)] text-[var(--text-tertiary)] uppercase text-xs border-b border-[var(--border-light)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Configuration Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Rules</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[var(--text-secondary)]"
                  >
                    <div className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading pricing configurations...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-rose-500"
                  >
                    <div className="inline-flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      <p>
                        Failed to load configurations:{" "}
                        {error?.message || "Unknown error"}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--border-default)] transition-colors text-[var(--text-primary)]"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : !configs || configs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[var(--text-tertiary)]"
                  >
                    <div className="inline-flex flex-col items-center gap-2">
                      <Calculator className="w-8 h-8 opacity-40" />
                      <p className="font-medium">
                        No pricing configurations found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr
                    key={config.id}
                    className="hover:bg-[var(--background-tertiary)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-sky-500/10 text-sky-500 p-2.5 rounded-xl shrink-0">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">{config.name}</div>
                          {config.description && (
                            <div className="text-xs text-[var(--text-secondary)] max-w-sm truncate">
                              {config.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          config.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : config.status === "DRAFT"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {config.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                      {config.components?.length ?? 0} rules
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {new Date(config.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/pricing/${config.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                      >
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
