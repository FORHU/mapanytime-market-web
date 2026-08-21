"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
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

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setCredentials({ email: "", password: "" });
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
  const handleCredentialChange = (e: ChangeEvent<HTMLInputElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!credentials.email.trim() || !credentials.password) {
      toast.error("Please provide both email and password.");
      return;
    }
    const toastId = toast.loading("Authenticating...");
    setLoadingStep("Verifying credentials...");
    try {
      const result = await login(credentials, config.apiRole as ApiUserRole);
      setLoadingStep("Loading workspace...");

      const roles = result.user?.roles || [];
      const isBuyer = isBuyerRole(roles);
      const isSeller = isSellerRole(roles);
      const isAdmin = isAdminRole(roles);
      const isAgent = isAgentRole(roles);

      toast.dismiss(toastId);

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
      toast.error(err instanceof Error ? err.message : "Login failed.", {
        id: toastId,
      });
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
                className="w-full py-3 rounded-lg font-medium bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2"
              >
                Seller Dashboard
              </button>
            )}
            {isBuyer && (
              <button
                onClick={() => router.push("/buyer")}
                className="w-full py-3 rounded-lg font-medium bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/50 transition-colors flex items-center justify-center gap-2"
              >
                Buyer Portal
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full py-3 rounded-lg font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
              >
                Admin Console
              </button>
            )}
            {isAgent && (
              <button
                onClick={() => router.push("/agent")}
                className="w-full py-3 rounded-lg font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center justify-center gap-2"
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

      <Card className="w-full max-w-md shadow-2xl border border-[var(--border-default)] bg-[var(--background-elevated)]/90 backdrop-blur-xl relative overflow-hidden">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(to right, ${config.accent}, #22d3ee, #6366f1)`,
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Portal badge */}
          <div className="flex items-center justify-center mb-5">
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
              <p className="text-xs text-[var(--text-tertiary)] text-center mb-5">
                {config.description}
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Field label="Email Address">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={isLoggingIn}
                      placeholder="name@domain.com"
                      value={credentials.email}
                      onChange={handleCredentialChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors disabled:opacity-60"
                    />
                  </div>
                </Field>

                <Field
                  label="Password"
                  action={
                    <a
                      href="#forgot"
                      className="text-[10px] font-bold text-sky-400 hover:underline"
                    >
                      Forgot?
                    </a>
                  }
                >
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      disabled={isLoggingIn}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={handleCredentialChange}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)] transition-colors disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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

                {isLoggingIn && (
                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-cyan-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    {loadingStep}
                  </div>
                )}
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
      </Card>
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
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 ${active ? "bg-[var(--brand-core)] text-white shadow-md" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
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
      className="w-full py-3 mt-2 font-extrabold text-xs rounded-xl text-white disabled:opacity-75 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:opacity-90"
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
      className="flex items-center gap-4 p-4 border rounded-xl hover:bg-[var(--background-secondary)] transition-colors text-left w-full"
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
