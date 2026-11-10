"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, Shield, X, Calendar, AlertCircle } from "lucide-react";
import { ApiError } from "@/shared/errors/api-error";
import { createAdminInvite } from "../api/adminInvite.client";
import {
  AdminInvite,
  INVITABLE_ADMIN_ROLES,
} from "../contracts/adminInvite.contract";

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invite: AdminInvite) => void;
}

export function InviteAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const invite = await createAdminInvite({
        email: cleanEmail,
        role,
        expiresInDays,
      });
      onSuccess(invite);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to dispatch admin invitation. Please verify email and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-admin-title"
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-2xl space-y-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="invite-admin-title"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                Invite Administrator
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Send a secure onboarding email to add a staff administrator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="invite-email"
              className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Recipient Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@mapanytime.com"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] focus:ring-1 focus:ring-[var(--brand-core)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Administrative Role
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {INVITABLE_ADMIN_ROLES.map((r) => {
                const isSelected = role === r.roleName;
                return (
                  <label
                    key={r.roleName}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5 shadow-sm"
                        : "border-[var(--border-default)] hover:bg-[var(--background-tertiary)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="admin-role"
                      value={r.roleName}
                      checked={isSelected}
                      onChange={() => setRole(r.roleName)}
                      disabled={isSubmitting}
                      className="mt-1 accent-[var(--brand-core)]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {r.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        {r.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="invite-expires"
              className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Invitation Expiration
            </label>
            <select
              id="invite-expires"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
            >
              <option value={1}>Expires in 24 hours</option>
              <option value={3}>Expires in 3 days</option>
              <option value={7}>Expires in 7 days (Recommended)</option>
              <option value={14}>Expires in 14 days</option>
              <option value={30}>Expires in 30 days</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-light)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-md hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Dispatching...
                </>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

