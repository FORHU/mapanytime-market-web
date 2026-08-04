"use client";

import React from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Copy, Building2, Users } from "lucide-react";

const AGENT_REFERRAL_ID = "REF-AGENT-8472";

const recruits = [
  {
    businessName: "Tech Haven Electronics",
    dateRecruited: "Oct 12, 2023",
    status: "active" as const,
    referralId: AGENT_REFERRAL_ID,
  },
  {
    businessName: "Northern Blooms Florist",
    dateRecruited: "Nov 3, 2023",
    status: "active" as const,
    referralId: AGENT_REFERRAL_ID,
  },
  {
    businessName: "Metro Plate Resto",
    dateRecruited: "Nov 18, 2023",
    status: "pending" as const,
    referralId: AGENT_REFERRAL_ID,
  },
  {
    businessName: "Skyline Apparel Co.",
    dateRecruited: "Dec 1, 2023",
    status: "active" as const,
    referralId: AGENT_REFERRAL_ID,
  },
];

const statusConfig: Record<
  string,
  { label: string; classes: string; dot: string }
> = {
  active: {
    label: "Active",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  pending: {
    label: "Pending Onboarding",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
};

export default function AgentRecruitedPage() {
  const handleCopy = () => {
    void navigator.clipboard?.writeText(AGENT_REFERRAL_ID);
    toast.success("Referral ID copied to clipboard");
  };

  return (
    <div className="py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Referral ID Banner ─── */}
        <Card className="shadow-xl border border-[var(--border-default)] bg-[var(--background-elevated)]/95 backdrop-blur-xl relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h2 className="text-sm font-black tracking-tight text-[var(--text-primary)] uppercase">
                    Referral ID
                  </h2>
                </div>
                <p className="font-mono text-xl sm:text-2xl font-extrabold tracking-wide text-[var(--text-primary)] select-all">
                  {AGENT_REFERRAL_ID}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] max-w-md">
                  Share this code with prospective merchants so they can be
                  linked to your account during registration.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleCopy}
                className="!h-10 text-xs font-bold rounded-xl whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                Copy Referral Link
              </Button>
            </div>
          </div>
        </Card>

        {/* ─── Recruits Table ─── */}
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
              Recently onboarded merchants linked to your referral ID
            </p>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[var(--border-light)]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Recruit / Business
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Date Recruited
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Referral ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recruits.map((recruit, index) => {
                    const { label, classes, dot } =
                      statusConfig[recruit.status];
                    return (
                      <tr
                        key={`${recruit.businessName}-${index}`}
                        className={`border-b border-[var(--border-light)] transition-colors hover:bg-[var(--background-tertiary)]/40 ${
                          index % 2 === 1
                            ? "bg-[var(--background-secondary)]/20"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {recruit.businessName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-[var(--text-secondary)]">
                            {recruit.dateRecruited}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${classes}`}
                          >
                            <span
                              className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`}
                            />
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                            {recruit.referralId}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>
                Showing {recruits.length} of {recruits.length} recruits
              </span>
              <span className="font-mono">{recruits.length} total</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
