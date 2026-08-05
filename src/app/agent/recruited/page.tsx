"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Building2 } from "lucide-react";
import { getAgentRecruits } from "@/features/agents/api/agent.client";
import type { AgentRecruit } from "@/features/agents/types";

const statusConfig: Record<
  AgentRecruit["status"],
  { classes: string; dot: string }
> = {
  Active: {
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  "Pending Onboarding": {
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  Incomplete: {
    classes: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AgentRecruitedPage() {
  const [recruits, setRecruits] = useState<AgentRecruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAgentRecruits()
      .then((items) => {
        if (active) setRecruits(items);
      })
      .catch((error) => {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load recruited sellers",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-xl border border-[var(--border-default)] bg-[var(--background-elevated)]/95 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                My Recruits
              </h2>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mb-5 ml-11">
              Sellers registered through your agent account
            </p>

            {isLoading ? (
              <p className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                Loading recruits...
              </p>
            ) : recruits.length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                No sellers recruited yet.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-[var(--border-light)]">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Seller Name
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Date Recruited
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruits.map((recruit, index) => {
                      const config = statusConfig[recruit.status];
                      return (
                        <tr
                          key={recruit.sellerId}
                          className={`border-b border-[var(--border-light)] transition-colors hover:bg-[var(--background-tertiary)]/40 ${
                            index % 2 === 1
                              ? "bg-[var(--background-secondary)]/20"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 text-xs font-bold text-[var(--text-primary)]">
                            {recruit.sellerName}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)]">
                            {formatDate(recruit.dateRecruited)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.classes}`}
                            >
                              <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}
                              />
                              {recruit.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && recruits.length > 0 && (
              <div className="mt-4 text-[11px] text-[var(--text-tertiary)]">
                {recruits.length} total recruit
                {recruits.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
