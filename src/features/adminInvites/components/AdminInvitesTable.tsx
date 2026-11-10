"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
} from "lucide-react";
import { ApiError } from "@/shared/errors/api-error";
import {
  listAdminInvites,
  revokeAdminInvite,
} from "../api/adminInvite.client";
import {
  AdminInvite,
  INVITABLE_ADMIN_ROLES,
  InviteStatus,
} from "../contracts/adminInvite.contract";

interface AdminInvitesTableProps {
  refreshTrigger?: number;
  onInviteRevoked?: (invite: AdminInvite) => void;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Revoked", value: "REVOKED" },
  { label: "Expired", value: "EXPIRED" },
];

export function AdminInvitesTable({
  refreshTrigger = 0,
  onInviteRevoked,
}: AdminInvitesTableProps) {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revocation state
  const [revokeTarget, setRevokeTarget] = useState<AdminInvite | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAdminInvites({
        status: statusFilter,
        page,
        limit: 10,
      });
      setInvites(result.invites);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } catch (err) {
      console.error("Failed to load admin invites", err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load invitations. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites, refreshTrigger]);

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;

    setIsRevoking(true);
    setRevokeError(null);
    try {
      const updated = await revokeAdminInvite(revokeTarget.id);
      setInvites((prev) =>
        prev.map((inv) => (inv.id === updated.id ? updated : inv)),
      );
      setRevokeTarget(null);
      if (onInviteRevoked) {
        onInviteRevoked(updated);
      }
    } catch (err) {
      console.error("Failed to revoke invite", err);
      setRevokeError(
        err instanceof ApiError
          ? err.message
          : "Failed to revoke invitation. Please try again.",
      );
    } finally {
      setIsRevoking(false);
    }
  };

  const getRoleLabel = (roleName: string) => {
    const roleDef = INVITABLE_ADMIN_ROLES.find((r) => r.roleName === roleName);
    return roleDef ? roleDef.label : roleName;
  };

  const renderStatusBadge = (status: InviteStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Revoked
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <AlertTriangle className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredInvites = invites.filter((inv) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      inv.email.toLowerCase().includes(term) ||
      inv.role.toLowerCase().includes(term) ||
      (inv.inviter?.email || "").toLowerCase().includes(term) ||
      (inv.inviter?.name || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => handleStatusFilterChange(f.value)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[var(--brand-core)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search invites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
            />
          </div>
          <button
            onClick={fetchInvites}
            title="Refresh invites"
            disabled={isLoading}
            className="p-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-core)] transition-colors disabled:opacity-50"
            aria-label="Refresh invites list"
          >
            <RotateCcw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-[var(--text-tertiary)]">
              Loading invitations...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-red-400">{error}</p>
            <button
              onClick={fetchInvites}
              className="px-4 py-1.5 rounded-xl bg-[var(--background-tertiary)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--background-primary)] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredInvites.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-[var(--text-tertiary)]/50" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              No invitations found
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {statusFilter !== "ALL"
                ? `No invitations with status "${statusFilter}".`
                : "No admin staff invitations have been sent yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)] text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                <th className="pb-3 px-4">Recipient</th>
                <th className="pb-3 px-4">Role</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Invited By</th>
                <th className="pb-3 px-4">Sent</th>
                <th className="pb-3 px-4">Expires</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] text-sm">
              {filteredInvites.map((invite) => {
                const isPending = invite.status === "PENDING";
                return (
                  <tr
                    key={invite.id}
                    className="hover:bg-[var(--background-tertiary)]/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-[var(--text-primary)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                        {invite.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-xs">{invite.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[var(--brand-core)]/10 text-[var(--brand-core)] border border-[var(--brand-core)]/20">
                        <Shield className="w-3.5 h-3.5" />
                        {getRoleLabel(invite.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {renderStatusBadge(invite.status)}
                    </td>
                    <td className="py-4 px-4 text-xs text-[var(--text-secondary)]">
                      {invite.inviter?.email || invite.inviter?.name || "System"}
                    </td>
                    <td className="py-4 px-4 text-xs text-[var(--text-tertiary)]">
                      {formatDate(invite.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-xs text-[var(--text-tertiary)]">
                      {formatDate(invite.expiresAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isPending ? (
                        <button
                          onClick={() => setRevokeTarget(invite)}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          title="Revoke invitation"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
            <span>
              Showing {filteredInvites.length} of {totalCount} invitations
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[var(--text-primary)] px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-modal-title"
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="max-w-md w-full p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4
                  id="revoke-modal-title"
                  className="text-base font-bold text-[var(--text-primary)]"
                >
                  Revoke Staff Invitation
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Are you sure you want to invalidate this invitation?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-light)] text-xs space-y-1">
              <p className="text-[var(--text-secondary)]">
                Recipient:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {revokeTarget.email}
                </span>
              </p>
              <p className="text-[var(--text-secondary)]">
                Role:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {getRoleLabel(revokeTarget.role)}
                </span>
              </p>
              <p className="text-[var(--text-secondary)]">
                Expires:{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {formatDate(revokeTarget.expiresAt)}
                </span>
              </p>
            </div>

            {revokeError && (
              <p className="text-xs font-bold text-rose-400">{revokeError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRevokeTarget(null);
                  setRevokeError(null);
                }}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                disabled={isRevoking}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRevoking ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Revoking...
                  </>
                ) : (
                  "Revoke Invitation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

