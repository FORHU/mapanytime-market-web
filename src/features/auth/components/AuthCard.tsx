"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { mapApiValidationToForm } from "@/shared/errors/map-validation";
import { shake } from "@/shared/lib/motion";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  User,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "../hooks/useAuth";
import {
  isSellerRole,
  isBuyerRole,
  isAdminRole,
  isAgentRole,
} from "../utils/resolveHomeRoute";
import type { UserRole as ApiUserRole } from "../api/login.api";
import type { LoginRole } from "../types";

export type AuthRole = "seller" | "buyer" | "universal";
type Tab = "login" | "register";
/** The inputs the login form actually renders — the only keys that can show a message. */
type LoginField = "email" | "password";
const LOGIN_FIELDS: LoginField[] = ["email", "password"];
type RegisterStep = "ROLE_SELECT" | "FIELDS_FORM" | "BUYER_APP_PROMPT";

interface AuthCardProps {
  defaultTab?: Tab;
  /** Which portal this card is for — controls copy, role, and visible tabs */
  portalRole: AuthRole;
}

const PORTAL_CONFIG: Record<
  AuthRole,
  {
    label: string;
    accent: string;
    description: string;
    apiRole: ApiUserRole;
    showRegister: boolean;
    redirectAfterLogin: (result: {
      hasStores: boolean;
      seller?: { isOnboarded: boolean; onboardingStep: number } | null;
    }) => string;
    redirectAfterRegister: string;
  }
> = {
  seller: {
    label: "Merchant",
    accent: "var(--brand-core)",
    description:
      "Access your merchant portal to manage stores, products & orders.",
    apiRole: "SELLER",
    showRegister: true,
    redirectAfterLogin: (r) =>
      r.hasStores && r.seller?.isOnboarded
        ? "/seller/manage-stores"
        : "/seller/onboarding",
    redirectAfterRegister: "/seller/onboarding",
  },
  buyer: {
    label: "Buyer",
    accent: "#10b981",
    description:
      "Find nearby stores, browse products, and place local pickups.",
    apiRole: "BUYER",
    showRegister: true,
    redirectAfterLogin: () => "/buyer",
    redirectAfterRegister: "/buyer",
  },
  universal: {
    label: "MapAnytime",
    accent: "var(--brand-core)",
    description: "Sign in to access the Buyer Live Map or Merchant Dashboard.",
    apiRole: "BUYER", // Default for unified login request, doesn't matter since backend ignores it
    showRegister: true,
    redirectAfterLogin: () => "/", // Default, dynamic routing overrides this
    redirectAfterRegister: "/", // Dynamic routing overrides this too
  },
};

export default function AuthCard({
  defaultTab = "login",
  portalRole,
}: AuthCardProps) {
  const router = useRouter();
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const config = PORTAL_CONFIG[portalRole];

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  // ── Login state ──────────────────────────────────────────────────
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [buyerDone, setBuyerDone] = useState(false);
  const [showDualRolePrompt, setShowDualRolePrompt] = useState(false);
  const [pendingAuthResult, setPendingAuthResult] = useState<any>(null);

  // ── Register state ───────────────────────────────────────────────
  const [registerStep, setRegisterStep] = useState<RegisterStep>(
    portalRole === "buyer" ? "FIELDS_FORM" : "ROLE_SELECT",
  );
  // For seller/universal portal: tracks whether user chose buyer or merchant
  const [selectedRegisterRole, setSelectedRegisterRole] = useState<
    "buyer" | "seller"
  >("seller");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  /** Field-keyed messages, always authored by the API (see the 422 branch on submit). */
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  /** Whole-form message for failures the server doesn't pin to a field — a 401 above all. */
  const [formError, setFormError] = useState<string | null>(null);

  // Refs sit on the input *wrappers*, not the inputs: the wrapper carries the
  // leading icon and the reveal toggle, and shaking the bare input would leave
  // them behind.
  const emailFieldRef = useRef<HTMLDivElement>(null);
  const passwordFieldRef = useRef<HTMLDivElement>(null);

  const shakeFields = (names: string[]) => {
    if (names.includes("email")) shake(emailFieldRef.current);
    if (names.includes("password")) shake(passwordFieldRef.current);
  };

  // A general failure ("Incorrect email or password") is a verdict on the pair, so
  // both inputs carry the error border — the server has not said which one is wrong.
  // The sentence itself renders once, under the password: printing it under both
  // fields would read as two separate problems rather than one.
  const emailMessage = loginErrors.email;
  const passwordMessage =
    [loginErrors.password, formError].filter(Boolean).join(" ") || undefined;
  const emailHasError = Boolean(emailMessage) || Boolean(formError);
  const passwordHasError = Boolean(passwordMessage);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setCredentials({ email: "", password: "" });
    setLoginErrors({});
    setFormError(null);
    setShowPassword(false);
    setLoadingStep("");
    setBuyerDone(false);
    setShowDualRolePrompt(false);
    setPendingAuthResult(null);
    setRegisterStep(portalRole === "buyer" ? "FIELDS_FORM" : "ROLE_SELECT");
    setSelectedRegisterRole("seller");
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const handleCredentialChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Retract the complaint about a field as soon as the user acts on it; leaving it
    // up while they retype reads as though the new value is wrong too. The form-level
    // message goes with it — "incorrect email or password" is a verdict on the pair
    // that was submitted, and one of them has just changed.
    setFormError(null);
    setLoginErrors((prev) => {
      if (!prev[e.target.name]) return prev;
      const next = { ...prev };
      delete next[e.target.name];
      return next;
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Errors are deliberately *not* cleared here. Wiping them up front collapsed the
    // message slot on every click and the response re-expanded it ~200ms later, which
    // is what made repeated submits jump. Each branch below instead writes the
    // complete error state, so there is never an intermediate empty frame.
    //
    // Pre-flight only — stops a pointless round-trip for an empty form. Every other
    // rule about what a valid email or password looks like belongs to the API.
    if (!credentials.email.trim() || !credentials.password) {
      const missing = [
        ...(credentials.email.trim() ? [] : ["email"]),
        ...(credentials.password ? [] : ["password"]),
      ];
      setLoginErrors({
        ...(credentials.email.trim() ? {} : { email: "Email is required." }),
        ...(credentials.password ? {} : { password: "Password is required." }),
      });
      setFormError(null);
      // Only the empty ones — shaking a field the user filled in correctly would
      // point them at the wrong place.
      shakeFields(missing);
      return;
    }
    setLoadingStep("Verifying credentials...");
    try {
      const result = await login(credentials, config.apiRole as ApiUserRole);
      setLoadingStep("Loading workspace...");
      setLoginErrors({});
      setFormError(null);

      const roles = result.user?.roles || [];
      const isBuyer = isBuyerRole(roles);
      const isSeller = isSellerRole(roles);
      const isAdmin = isAdminRole(roles);
      const isAgent = isAgentRole(roles);

      if (roles.length > 1) {
        setPendingAuthResult(result);
        setShowDualRolePrompt(true);
      } else if (isSeller) {
        toast.success("Redirecting to Seller Dashboard...");
        setTimeout(() => {
          router.push(
            result.hasStores && result.seller?.isOnboarded
              ? "/seller/manage-stores"
              : "/seller/onboarding",
          );
        }, 500);
      } else if (isBuyer) {
        toast.success("Redirecting to Buyer Dashboard...");
        setTimeout(() => {
          router.push("/buyer");
        }, 500);
      } else if (isAdmin) {
        toast.success("Redirecting to Admin Portal...");
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else if (isAgent) {
        toast.success("Redirecting to Agent Portal...");
        setTimeout(() => {
          router.push("/agent");
        }, 500);
      } else {
        toast.success("Login Successful...");
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (err) {
      setLoadingStep("");

      // A 422 names the fields it rejected, so show those inline against the inputs
      // rather than as a toast the user has to map back to a field themselves.
      const fields = mapApiValidationToForm(err);
      const fieldNames = Object.keys(fields);

      if (fieldNames.length > 0) {
        // Only `email` and `password` have somewhere to render. A message about
        // any other key would otherwise be set into state and shown nowhere —
        // survivable while a toast was the fallback, silent now that it isn't.
        const inline = fieldNames.filter((name) =>
          LOGIN_FIELDS.includes(name as LoginField),
        );
        const orphaned = fieldNames.filter((name) => !inline.includes(name));

        setLoginErrors(
          Object.fromEntries(
            inline.map((name) => [name, fields[name].join(" ")]),
          ),
        );
        setFormError(
          orphaned.length > 0
            ? orphaned.map((name) => fields[name].join(" ")).join(" ")
            : null,
        );
        shakeFields(inline.length > 0 ? inline : LOGIN_FIELDS);
        return;
      }

      // Everything else — a 401 for bad credentials above all — is a whole-form
      // problem. The text comes from the API; the client does not decide what a
      // failed sign-in means. Both fields shake because the server has not said
      // which of the two is wrong, and guessing would send the user to fix the
      // one that was already right.
      //
      // Clearing the field errors is load-bearing now that they are not wiped on
      // submit: without it, a stale 422 message would sit under a field alongside
      // the new general one.
      setLoginErrors({});
      setFormError(err instanceof Error ? err.message : "Login failed.");
      shakeFields(["email", "password"]);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // For seller/universal portal: use the role the user selected (buyer or seller)
    const apiRole =
      portalRole !== "buyer"
        ? (selectedRegisterRole.toUpperCase() as ApiUserRole)
        : (config.apiRole as ApiUserRole);
    try {
      await register(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        apiRole,
      );
      const isBuyerFlow =
        portalRole === "buyer" || selectedRegisterRole === "buyer";
      if (isBuyerFlow) {
        setRegisterStep("BUYER_APP_PROMPT");
      } else {
        router.push(config.redirectAfterRegister);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  // ── Buyer / Agent success screen ─────────────────────────────────
  if (buyerDone) {
    return (
      <PageShell>
        <BrandLink />
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border border-[var(--border-default)] bg-[var(--background-elevated)]/90 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-7 h-7" />
          </div>
          <h2 className="text-base font-black mb-2">Login Successful!</h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            Logged in as a buyer. Please check your email for further
            instructions.
          </p>
        </Card>
      </PageShell>
    );
  }

  if (showDualRolePrompt && pendingAuthResult) {
    const roles = pendingAuthResult.user?.roles || [];
    const isBuyer = isBuyerRole(roles);
    const isSeller = isSellerRole(roles);
    const isAdmin = isAdminRole(roles);
    const isAgent = isAgentRole(roles);

    return (
      <PageShell>
        <BrandLink />
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border border-[var(--border-default)] bg-[var(--background-elevated)]/90 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black mb-2">Welcome back!</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            Your account has multiple access levels. Where would you like to go
            today?
          </p>
          <div className="flex flex-col gap-3">
            {isSeller && (
              <button
                onClick={() =>
                  router.push(
                    pendingAuthResult.hasStores &&
                      pendingAuthResult.seller?.isOnboarded
                      ? "/seller/manage-stores"
                      : "/seller/onboarding",
                  )
                }
                className="w-full py-3 rounded-lg font-medium bg-primary text-on-primary hover:bg-primary-fixed transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] flex items-center justify-center gap-2"
              >
                Seller Dashboard
              </button>
            )}
            {isBuyer && (
              <button
                onClick={() => router.push("/buyer")}
                className="w-full py-3 rounded-lg font-medium bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/50 transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] flex items-center justify-center gap-2"
              >
                Buyer Portal
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full py-3 rounded-lg font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] flex items-center justify-center gap-2"
              >
                Admin Console
              </button>
            )}
            {isAgent && (
              <button
                onClick={() => router.push("/agent")}
                className="w-full py-3 rounded-lg font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] flex items-center justify-center gap-2"
              >
                Support Agent Portal
              </button>
            )}
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BrandLink />

      {/* A plain div rather than <Card>: this card overrides everything Card
          provides, and Card's baked-in `p-4` was stacking with the `p-6 sm:p-8`
          below it — 40px of padding a side, which cost a third of the content
          width at 320px. Card also set its background and border through the
          inline `style` attribute, which beat the translucent classes here and
          left `backdrop-blur-xl` doing nothing. */}
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-default)] bg-[var(--background-elevated)]/90 backdrop-blur-xl relative overflow-hidden">
        {/* Accent bar */}
        <div
          className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
          style={{
            background: `linear-gradient(to right, ${config.accent}, #22d3ee, #6366f1)`,
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Portal badge. 16px to the tabs — both are header chrome, so they sit
              at the same rhythm as the fields below and read as one block. */}
          <div className="flex items-center justify-center mb-4">
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${config.accent}18`,
                color: config.accent,
              }}
            >
              {config.label} Portal
            </span>
          </div>

          {/* Tab switcher — only if register is available */}
          {config.showRegister && (
            <div className="flex items-center gap-1 p-1 mb-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-light)]">
              <TabButton
                active={activeTab === "login"}
                onClick={() => switchTab("login")}
                icon={<LogIn className="w-3.5 h-3.5" />}
                label="Sign In"
              />
              <TabButton
                active={activeTab === "register"}
                onClick={() => switchTab("register")}
                icon={<UserPlus className="w-3.5 h-3.5" />}
                label="Register"
              />
            </div>
          )}

          {/* ── LOGIN ─────────────────────────────────────────── */}
          {activeTab === "login" && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              {/* 32px — twice the 16px gap between fields, so the form reads as
                  its own group rather than a continuation of the header. */}
              <p className="text-xs text-[var(--text-tertiary)] text-center mb-8">
                {config.description}
              </p>

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-4"
                noValidate
              >
                <Field
                  label="Email Address"
                  error={emailMessage}
                  errorId="login-email-error"
                  reserveError
                >
                  <div className="relative" ref={emailFieldRef}>
                    <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="email"
                      name="email"
                      aria-invalid={emailHasError}
                      aria-describedby={
                        emailMessage
                          ? "login-email-error"
                          : // A general failure has no message of its own here, so point
                            // the email field at the one under the password.
                            formError
                            ? "login-password-error"
                            : undefined
                      }
                      disabled={isLoggingIn}
                      placeholder="name@domain.com"
                      value={credentials.email}
                      onChange={handleCredentialChange}
                      className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors disabled:opacity-60 ${fieldStateClasses(emailHasError)}`}
                    />
                  </div>
                </Field>

                <Field
                  label="Password"
                  error={passwordMessage}
                  errorId="login-password-error"
                  reserveError
                  action={
                    <a
                      href="#forgot"
                      className="text-[11px] font-bold text-[var(--brand-core)] hover:underline"
                    >
                      Forgot?
                    </a>
                  }
                >
                  <div className="relative" ref={passwordFieldRef}>
                    <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      aria-invalid={passwordHasError}
                      aria-describedby={
                        passwordMessage ? "login-password-error" : undefined
                      }
                      disabled={isLoggingIn}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={handleCredentialChange}
                      className={`w-full ps-10 pe-10 py-2.5 rounded-xl border text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors disabled:opacity-60 ${fieldStateClasses(passwordHasError)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      {/* Both icons stay mounted and stacked so they can cross-fade
                          instead of popping. The wrapper is explicitly sized —
                          absolutely positioning both children would otherwise
                          collapse it and shift the input's padding. */}
                      <span className="relative block w-4 h-4">
                        <Eye
                          aria-hidden
                          className={`icon-swap absolute inset-0 w-4 h-4 ${
                            showPassword
                              ? "opacity-0 scale-[0.25] blur-[4px]"
                              : "opacity-100 scale-100 blur-0"
                          }`}
                        />
                        <EyeOff
                          aria-hidden
                          className={`icon-swap absolute inset-0 w-4 h-4 ${
                            showPassword
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-[0.25] blur-[4px]"
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                </Field>

                <SubmitButton
                  loading={isLoggingIn}
                  loadingLabel={loadingStep || "Authenticating..."}
                  icon={<LogIn className="w-4 h-4" />}
                  label="Sign In"
                  accent={config.accent}
                />
              </form>

              {config.showRegister && (
                <p className="mt-5 text-center text-xs text-[var(--text-tertiary)]">
                  {"Don't have an account? "}
                  <button
                    onClick={() => switchTab("register")}
                    className="font-bold text-[var(--brand-core)] hover:underline"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          )}

          {/* ── REGISTER ──────────────────────────────────────── */}
          {activeTab === "register" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Role select step for universal / seller portals */}
              {registerStep === "ROLE_SELECT" && portalRole !== "buyer" && (
                <>
                  <p className="text-xs text-[var(--text-tertiary)] text-center mb-5">
                    Select your registration type
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <RoleCard
                      icon={<User className="w-5 h-5" />}
                      iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500"
                      title="Register as a Buyer"
                      desc="Explore hyper-local networks, view physical markers, and place local pick-ups."
                      onClick={() => {
                        setSelectedRegisterRole("buyer");
                        setRegisterStep("FIELDS_FORM");
                      }}
                    />
                    <RoleCard
                      icon={<ShieldCheck className="w-5 h-5" />}
                      iconBg="bg-sky-50 dark:bg-sky-950/40"
                      iconStyle={{ color: "var(--brand-core)" }}
                      title="Register as a Verified Merchant"
                      desc="Map store coordinates, drop cloud catalog layers, and service offline commerce."
                      onClick={() => {
                        setSelectedRegisterRole("seller");
                        setRegisterStep("FIELDS_FORM");
                      }}
                    />
                  </div>
                </>
              )}

              {/* Fields form */}
              {registerStep === "FIELDS_FORM" && (
                <>
                  {portalRole !== "buyer" && (
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setRegisterStep("ROLE_SELECT")}
                        className="text-[10px] font-bold text-[var(--text-tertiary)] hover:text-[var(--brand-core)] transition-colors cursor-pointer"
                      >
                        ← Back
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Registering as{" "}
                        <span className="font-bold text-[var(--text-primary)] capitalize">
                          {selectedRegisterRole === "buyer"
                            ? "Buyer"
                            : "Merchant"}
                        </span>
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name">
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Juan"
                          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
                          style={{ borderColor: "var(--border-default)" }}
                        />
                      </Field>
                      <Field label="Last Name">
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="dela Cruz"
                          className="w-full px-3 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
                          style={{ borderColor: "var(--border-default)" }}
                        />
                      </Field>
                    </div>

                    <Field label="Email Address">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
                          style={{ borderColor: "var(--border-default)" }}
                        />
                      </div>
                    </Field>

                    <Field label="Password">
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                        <input
                          type="password"
                          name="password"
                          required
                          minLength={8}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min. 8 characters"
                          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs bg-[var(--background-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors"
                          style={{ borderColor: "var(--border-default)" }}
                        />
                      </div>
                    </Field>

                    <SubmitButton
                      loading={isRegistering}
                      loadingLabel="Creating Account..."
                      icon={<UserPlus className="w-4 h-4" />}
                      label="Create Account"
                      accent={config.accent}
                    />
                  </form>
                </>
              )}

              {/* Buyer app prompt */}
              {registerStep === "BUYER_APP_PROMPT" && (
                <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base font-black">
                      Download MapAnytime Mobile
                    </h2>
                    <p className="text-xs text-[var(--text-tertiary)] max-w-xs mx-auto mt-1">
                      Account verified! Browse store pins and check out locally
                      via our native app.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <a
                      href="#app-store"
                      className="w-full py-2.5 text-center text-xs font-bold border rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      Download on iOS App Store
                    </a>
                    <a
                      href="#google-play"
                      className="w-full py-2.5 text-center text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: config.accent }}
                    >
                      Get it on Google Play
                    </a>
                  </div>
                </div>
              )}

              {registerStep !== "BUYER_APP_PROMPT" && (
                <p className="mt-5 text-center text-xs text-[var(--text-tertiary)]">
                  Already have an account?{" "}
                  <button
                    onClick={() => switchTab("login")}
                    className="font-bold text-[var(--brand-core)] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a neutral background before hydration to avoid flicker
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
        {children}
      </div>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: isLight ? "#f1f5f9" : "#020d1a" }}
    >
      {/* Map background */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isLight ? "opacity-60" : "opacity-35"
        }`}
        style={{
          backgroundImage: `url('${isLight ? "/auth-map-daytime.jpg" : "/auth-map-realistic-ph.jpg"}')`,
        }}
      />

      {/* Gradient overlay to make card pop */}
      {isLight ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc]/80 via-[#f8fafc]/40 to-[#f8fafc]/80" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#020d1a]/80 via-[#020d1a]/50 to-[#020d1a]/80" />
      )}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, transparent 40%, #f1f5f9 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, #020d1a 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

function BrandLink() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <Link
      href="/"
      className={`font-black text-2xl tracking-tight mb-8 select-none drop-shadow-lg transition-colors ${
        isLight ? "text-slate-800" : "text-white"
      }`}
    >
      Map<span className="text-[var(--brand-core)]">Anytime</span>
    </Link>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.96] ${active ? "bg-[var(--brand-core)] text-white shadow-md" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * The error border deliberately outranks `focus:` — a field stays visibly wrong
 * while it is wrong, and flips back on the first keystroke because
 * `handleCredentialChange` clears the error there.
 */
function fieldStateClasses(hasError: boolean) {
  return hasError
    ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
    : "border-[var(--border-default)] bg-[var(--background-primary)] focus:border-[var(--brand-core)]";
}

function Field({
  label,
  action,
  children,
  error,
  errorId,
  reserveError,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Server-supplied message for this field. The text is never composed here. */
  error?: string;
  /** Lets the caller point its input's `aria-describedby` at the message below. */
  errorId?: string;
  /**
   * Hold the message line whether or not there is a message, so an error appearing
   * cannot push the rest of the form down. Opt-in: fields that never show an error
   * would otherwise carry the gap for nothing.
   */
  reserveError?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </label>
        {action}
      </div>
      {children}
      {/* Announced rather than only shown: a toast is invisible to a screen reader
          user who is still focused on the input that caused it. */}
      {reserveError ? (
        // `leading-4` + `min-h-4` pin the line box to exactly 16px instead of
        // inheriting preflight's 1.5, so the reserved height is deterministic.
        <p
          id={errorId}
          role="alert"
          className="min-h-4 text-[11px] leading-4 text-rose-500"
        >
          {/* A permanently mounted <p> can never replay its entrance animation, so
              the message lives in a span keyed on its own text: a *different*
              message remounts and fades in, an identical one does not. That is the
              repeat-click case — same error, so nothing should move but the shake. */}
          {error && (
            <span key={error} className="auth-error-enter inline-block">
              {error}
            </span>
          )}
        </p>
      ) : (
        error && (
          <p
            id={errorId}
            role="alert"
            className="auth-error-enter text-[11px] text-rose-500"
          >
            {error}
          </p>
        )
      )}
    </div>
  );
}

function SubmitButton({
  loading,
  loadingLabel,
  icon,
  label,
  accent,
}: {
  loading: boolean;
  loadingLabel: string;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 mt-2 font-extrabold text-xs rounded-xl text-white disabled:opacity-75 transition-[opacity,transform] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:opacity-90"
      style={{ backgroundColor: accent }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function RoleCard({
  icon,
  iconBg,
  iconStyle,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconStyle?: React.CSSProperties;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 border rounded-xl hover:bg-[var(--background-secondary)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] text-left w-full"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`} style={iconStyle}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold">{title}</div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
