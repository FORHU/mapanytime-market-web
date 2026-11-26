"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react";
import { ApiError } from "@/shared/errors/api-error";
import {
  validateAdminInvite,
  acceptAdminInvite,
} from "../api/adminInvite.client";
import {
  INVITABLE_ADMIN_ROLES,
  ValidateInviteData,
} from "../contracts/adminInvite.contract";

export function AcceptInviteCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isValidating, setIsValidating] = useState(true);
  const [validationData, setValidationData] =
    useState<ValidateInviteData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setValidationError(
        "No invitation token provided. Please open the link received in your staff invitation email.",
      );
      return;
    }

    let isMounted = true;
    setIsValidating(true);
    setValidationError(null);

    validateAdminInvite(token)
      .then((data) => {
        if (isMounted) {
          if (data.valid) {
            setValidationData(data);
          } else {
            setValidationError(
              "This invitation is no longer valid. It may have expired or been revoked.",
            );
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to validate invitation token", err);
          setValidationError(
            err instanceof ApiError
              ? err.message
              : "Unable to validate invitation. The link may have expired or been revoked.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsValidating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await acceptAdminInvite({
        token,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to accept invite", err);
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Failed to activate your account. Please try again or contact support.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (roleName: string) => {
    const roleDef = INVITABLE_ADMIN_ROLES.find((r) => r.roleName === roleName);
    return roleDef ? roleDef.label : roleName;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 sm:p-9 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/70 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Loading State */}
        {isValidating && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-9 h-9 text-[var(--brand-core)] animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Verifying Staff Invitation
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Please wait while we validate your invitation token...
              </p>
            </div>
          </div>
        )}

        {/* Validation Failure State */}
        {!isValidating && validationError && (
          <div className="py-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Invitation Invalid
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                {validationError}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--background-primary)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-core)] transition-colors shadow-sm"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isValidating && !validationError && isSuccess && (
          <div className="py-6 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Account Activated!
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Your administrative account for{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {validationData?.email}
                </span>{" "}
                has been successfully set up.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--background-primary)] border border-[var(--border-default)] text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Assigned Role</span>
                <span className="font-bold text-[var(--brand-core)] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {validationData ? getRoleLabel(validationData.role) : "Staff"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Account Status</span>
                <span className="font-bold text-emerald-400">Active</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all"
              >
                Proceed to Dashboard Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Account Setup Form */}
        {!isValidating && !validationError && !isSuccess && validationData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand-core)]/10 text-[var(--brand-core)] flex items-center justify-center mx-auto border border-[var(--brand-core)]/20 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Complete Staff Setup
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Create a password to activate your MapAnytime administration
                account.
              </p>
            </div>

            {/* Invite Details Badge */}
            <div className="p-3.5 rounded-2xl bg-[var(--background-primary)] border border-[var(--border-default)] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Invited As:</span>
                <span className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                  {validationData.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Role:</span>
                <span className="font-bold text-[var(--brand-core)] inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {getRoleLabel(validationData.role)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-light)]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Expires
                </span>
                <span>{formatDate(validationData.expiresAt)}</span>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="first-name"
                    className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Jane"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="last-name"
                    className="text-xs font-bold text-[var(--text-primary)]"
                  >
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    disabled={isSubmitting}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    disabled={isSubmitting}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating Account...
                  </>
                ) : (
                  <>
                    Activate Staff Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

