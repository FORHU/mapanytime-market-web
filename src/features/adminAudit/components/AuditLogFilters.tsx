"use client";

import React from "react";
import { Filter, Calendar, RotateCcw, User } from "lucide-react";

export interface AuditLogFiltersProps {
  action: string;
  onActionChange: (action: string) => void;
  staffSearch: string;
  onStaffSearchChange: (search: string) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  onReset: () => void;
}

const ACTION_OPTIONS = [
  { label: "All Actions", value: "ALL" },
  { label: "Invite Created", value: "ADMIN_INVITE_CREATED" },
  { label: "Invite Revoked", value: "ADMIN_INVITE_REVOKED" },
  { label: "Invite Accepted", value: "ADMIN_INVITE_ACCEPTED" },
  { label: "Role Created", value: "ROLE_CREATED" },
  { label: "Role Permissions Updated", value: "ROLE_PERMISSIONS_UPDATED" },
  { label: "Pricing Config Created", value: "PRICING_CONFIG_CREATED" },
  { label: "Pricing Config Updated", value: "PRICING_CONFIG_UPDATED" },
  { label: "Pricing Config Activated", value: "PRICING_CONFIG_ACTIVATED" },
  { label: "Pricing Config Archived", value: "PRICING_CONFIG_ARCHIVED" },
  { label: "Pricing Component Added", value: "PRICING_COMPONENT_ADDED" },
  { label: "Pricing Component Updated", value: "PRICING_COMPONENT_UPDATED" },
  { label: "Pricing Component Deleted", value: "PRICING_COMPONENT_DELETED" },
  { label: "Seller Payout Status Updated", value: "PAYOUT_STATUS_UPDATED" },
  { label: "Agent Payout Approved", value: "AGENT_PAYOUT_APPROVED" },
  { label: "Agent Payout Rejected", value: "AGENT_PAYOUT_REJECTED" },
  { label: "Store Approved", value: "STORE_APPROVED" },
  { label: "Store Rejected", value: "STORE_REJECTED" },
];

export function AuditLogFilters({
  action,
  onActionChange,
  staffSearch,
  onStaffSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onReset,
}: AuditLogFiltersProps) {
  const isFiltered =
    action !== "ALL" ||
    staffSearch.trim() !== "" ||
    fromDate !== "" ||
    toDate !== "";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Action Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Action Type
          </label>
          <div className="relative">
            <select
              value={action}
              onChange={(e) => onActionChange(e.target.value)}
              aria-label="Filter by action"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Staff Member / Actor Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Staff Member / Actor ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={staffSearch}
              onChange={(e) => onStaffSearchChange(e.target.value)}
              placeholder="Filter by actor ID..."
              aria-label="Filter by staff member"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Date From */}
        <div className="w-[160px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              aria-label="Filter from date"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-2 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Date To */}
        <div className="w-[160px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            To Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              aria-label="Filter to date"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-2 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <div className="self-end pb-0.5">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
