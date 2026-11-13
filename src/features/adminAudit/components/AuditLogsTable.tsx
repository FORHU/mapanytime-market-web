"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminAuditLogs } from "../hooks/useAdminAuditLogs";
import { AuditLogFilters } from "./AuditLogFilters";
import { AuditLogItem } from "../contracts/auditLog.contract";

export function AuditLogsTable() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const [staffSearch, setStaffSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminAuditLogs({
      page,
      limit,
      action: actionFilter !== "ALL" ? actionFilter : undefined,
      performedById: staffSearch.trim() || undefined,
      from: fromDate ? new Date(fromDate).toISOString() : undefined,
      to: toDate
        ? new Date(`${toDate}T23:59:59.999Z`).toISOString()
        : undefined,
    });

  const handleReset = () => {
    setActionFilter("ALL");
    setStaffSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const getActionBadgeColor = (action: string) => {
    if (
      action.includes("REJECT") ||
      action.includes("ARCHIVE") ||
      action.includes("REVOKE") ||
      action.includes("DELETE")
    ) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    if (
      action.includes("APPROVE") ||
      action.includes("ACTIVATE") ||
      action.includes("ACCEPT")
    ) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (action.includes("PRICING")) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    if (action.includes("ROLE")) {
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
    return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  };

  const formatSummary = (item: AuditLogItem) => {
    if (!item.metadata) return null;
    const m = item.metadata as Record<string, unknown>;

    if (m.reason) return `Reason: "${m.reason}"`;
    if (m.role) return `Role: ${m.role}`;
    if (m.roleName) return `Role: ${m.roleName}`;
    if (m.refundedAmount) return `Refunded: ₱${m.refundedAmount}`;
    if (m.amount) return `Amount: ₱${m.amount}`;
    if (m.name) return `Name: ${m.name}`;
    if (m.email) return `Email: ${m.email}`;
    if (m.after && typeof m.after === "object") {
      const keys = Object.keys(m.after as object);
      return `Updated keys: ${keys.join(", ")}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
            Security & Activity Audit Logs
          </h1>
          <p className="text-sm text-slate-400">
            Immutable, searchable ledger of administrative staff actions, fee
            changes, and payouts.
          </p>
        </div>
        {isFetching && (
          <span className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Updating...
          </span>
        )}
      </div>

      {/* Filters Bar */}
      <AuditLogFilters
        action={actionFilter}
        onActionChange={(val) => {
          setActionFilter(val);
          setPage(1);
        }}
        staffSearch={staffSearch}
        onStaffSearchChange={(val) => {
          setStaffSearch(val);
          setPage(1);
        }}
        fromDate={fromDate}
        onFromDateChange={(val) => {
          setFromDate(val);
          setPage(1);
        }}
        toDate={toDate}
        onToDateChange={(val) => {
          setToDate(val);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Loading audit records...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-400 space-y-2">
            <p className="text-sm font-medium">
              Failed to load audit logs: {error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              Retry
            </button>
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              No audit logs found
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your action type, actor, or date filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.items.map((item) => {
                  const isExpanded = expandedRowId === item.id;
                  const summary = formatSummary(item);

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleExpand(item.id)}
                        className="hover:bg-slate-800/40 transition cursor-pointer select-none"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {format(
                              new Date(item.createdAt),
                              "yyyy-MM-dd HH:mm:ss",
                            )}
                          </div>
                        </td>

                        {/* Staff Member */}
                        <td className="py-3 px-4 text-slate-200">
                          {item.performedBy ? (
                            <div>
                              <div className="font-medium text-xs text-slate-200">
                                {item.performedBy.name || "Administrator"}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.performedBy.email || item.performedBy.id}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              System Job
                            </span>
                          )}
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getActionBadgeColor(
                              item.action,
                            )}`}
                          >
                            {item.action}
                          </span>
                        </td>

                        {/* Target Entity */}
                        <td className="py-3 px-4 text-xs font-mono text-slate-300">
                          <span className="text-slate-500">
                            {item.entityType}:
                          </span>
                          <span className="ml-1 text-slate-300 truncate max-w-[120px] inline-block align-bottom">
                            {item.entityId}
                          </span>
                        </td>

                        {/* Summary */}
                        <td className="py-3 px-4 text-xs text-slate-400 max-w-[200px] truncate">
                          {summary || <span className="text-slate-600">—</span>}
                        </td>

                        {/* Expand Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            aria-label={
                              isExpanded
                                ? "Collapse metadata"
                                : "Expand metadata"
                            }
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Metadata Row */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td
                            colSpan={6}
                            className="p-4 border-t border-slate-800/80"
                          >
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                                <span>
                                  Context & Audit Metadata (ID: {item.id})
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  Entity: {item.entityType} #{item.entityId}
                                </span>
                              </div>
                              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
                                {JSON.stringify(item.metadata ?? {}, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page{" "}
              <span className="text-white font-medium">{data.page}</span> of{" "}
              <span className="text-white font-medium">{data.totalPages}</span>{" "}
              ({data.total} total events)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
