"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { setPassword } from "@/features/auth/api/login.api";
import { setSetupSessionCookie } from "@/shared/lib/token";

/**
 * Where a one-time code becomes a password.
 *
 * The web app had no forgot-password or reset-password screen at all — only the
 * Flutter client shipped one — so a staff member handed a set-up code had
 * nowhere to redeem it and could never sign in. Email and code prefill from the
 * link an admin copies, and both stay editable so this doubles as the manual
 * entry point for anyone who has a code but not the link.
 */
function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.get("code")) setSetupSessionCookie();
  }, [params]);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    email.trim() &&
    code.trim() &&
    password.length >= 8 &&
    password === confirm &&
    !submitting;

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await setPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
      toast.success("Password set — you can sign in now");
      router.push("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not set your password",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--brand-core)]";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--background-secondary)" }}
    >
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-[var(--text-primary)]">
            Set your password
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter the code you were sent, then choose a password.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">
            Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            className={field}
          />
          {tooShort && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
          />
          {mismatch && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Both passwords must match.
            </p>
          )}
        </div>

        <Button
          fullWidth
          isLoading={submitting}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Set password
        </Button>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  // useSearchParams needs a Suspense boundary under the App Router.
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
}
