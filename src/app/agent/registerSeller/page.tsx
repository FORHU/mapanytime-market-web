"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { registerSeller } from "@/features/agents/api/agent.client";
import AgentOnboardingForm from "@/features/agents/components/AgentOnboardingForm";
import type { SellerRegistrationResult } from "@/features/agents/types";
import {
  User,
  Store,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Building2,
  BadgeCheck,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Copy,
  KeyRound,
} from "lucide-react";

type WorkflowStep = "registration" | "credentials" | "onboarding";

export default function AgentRegisterSellerPage() {
  const router = useRouter();
  const [registration, setRegistration] =
    useState<SellerRegistrationResult | null>(null);
  const [workflowStep, setWorkflowStep] =
    useState<WorkflowStep>("registration");
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    storeName: "",
    businessEmail: "",
    businessPhone: "",
    sellerPlan: "",
    agentNotes: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registration) {
      setWorkflowStep("credentials");
      return;
    }

    setIsRegistering(true);
    try {
      const result = await registerSeller({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        storeName: formData.storeName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        sellerPlan: formData.sellerPlan,
        agentNotes: formData.agentNotes || undefined,
      });
      setRegistration(result);
      setWorkflowStep("credentials");
      setMaxStepReached(1);
      toast.success("Seller account created", {
        description: "Continue to complete the Seller's store onboarding.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Seller registration failed",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClear = () => {
    if (registration) return;

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      storeName: "",
      businessEmail: "",
      businessPhone: "",
      sellerPlan: "",
      agentNotes: "",
    });
    toast.info("Form cleared");
  };

  const inputClasses =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)]/20 focus:border-[var(--brand-core)] transition-all duration-200";

  return (
    <div className="py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-left w-full">
        {registration && (
          <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)]/80 p-2">
            {(
              [
                ["registration", "Registration"],
                ["credentials", "Credentials"],
                ["onboarding", "Onboarding"],
              ] as const
            ).map(([key, label], index) => {
              const steps = [
                "registration",
                "credentials",
                "onboarding",
              ] as const;
              const isCurrent = workflowStep === key;
              const isComplete = steps.indexOf(workflowStep) > index;
              const isLocked = index > maxStepReached;
              return (
                <React.Fragment key={key}>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (key === "registration")
                        setWorkflowStep("registration");
                      if (key === "credentials") setWorkflowStep("credentials");
                      if (key === "onboarding") setWorkflowStep("onboarding");
                    }}
                    className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      isCurrent
                        ? "bg-[var(--brand-core)] text-white"
                        : isComplete
                          ? "text-emerald-500"
                          : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[9px]">
                      {isComplete ? "✓" : index + 1}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                  {index < 2 && (
                    <span className="h-px w-3 shrink-0 bg-[var(--border-light)]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {registration && workflowStep === "credentials" && (
          <Card className="mb-5 space-y-5 p-6 sm:p-8 shadow-xl border border-[var(--border-default)] bg-[var(--background-elevated)]/95 backdrop-blur-xl rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10">
                <KeyRound className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">
                  Seller Account Created
                </h2>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Review the credentials before completing onboarding.
                </p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-4 text-xs">
              <p className="font-bold text-[var(--text-secondary)]">
                Temporary credentials
              </p>
              <p className="flex justify-between gap-4">
                <span>Email</span>
                <strong>{registration.email}</strong>
              </p>
              <p className="flex justify-between gap-4">
                <span>Temporary password</span>
                <strong className="font-mono">
                  {registration.temporaryPassword}
                </strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    `Email: ${registration.email}\nTemporary password: ${registration.temporaryPassword}`,
                  );
                  toast.success("Credentials copied");
                }}
                className="inline-flex items-center gap-1.5 font-bold text-cyan-400"
              >
                <Copy className="h-3.5 w-3.5" /> Copy credentials
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWorkflowStep("registration")}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Registration
              </button>
              <Button
                onClick={() => {
                  setMaxStepReached(2);
                  setWorkflowStep("onboarding");
                }}
              >
                Continue to Onboarding <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {registration && (
          <div className={workflowStep === "onboarding" ? "block" : "hidden"}>
            <AgentOnboardingForm
              seller={registration}
              initialStep="store"
              onBack={() => setWorkflowStep("credentials")}
              onComplete={() => router.push("/agent")}
            />
          </div>
        )}

        {workflowStep === "registration" && (
          <Card className="shadow-xl border border-[var(--border-default)] bg-[var(--background-elevated)]/95 backdrop-blur-xl relative overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, var(--brand-core) 1px, transparent 1px), radial-gradient(circle at 75% 75%, var(--brand-core) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            <div className="relative">
              {/* ─── Session Banner ─── */}
              <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[var(--border-light)] bg-gradient-to-r from-cyan-500/8 via-sky-500/4 to-transparent">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-3 text-[11px]">
                  <span className="font-bold text-[var(--text-secondary)] whitespace-nowrap">
                    Active Session
                  </span>
                  <span className="text-[var(--border-default)] select-none">
                    •
                  </span>
                  <span className="text-[var(--text-primary)] font-medium truncate">
                    Authenticated Support Agent
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--background-tertiary)] text-[var(--text-tertiary)] font-mono text-[10px] whitespace-nowrap">
                    LIVE
                  </span>
                </div>
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="p-6 sm:p-8">
                {/* ─── Header ─── */}
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                        Register New Seller
                      </h2>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        Create a seller account on behalf of your client
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={Boolean(registration)}
                    className="text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--background-tertiary)]"
                  >
                    {registration ? "Registration Complete" : "Clear Form"}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ─── Personal Details ─── */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <h3 className="text-sm font-black tracking-tight text-[var(--text-primary)]">
                        Personal Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          First Name <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            placeholder="Juan"
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Last Name <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            placeholder="Dela Cruz"
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Email <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="seller@domain.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            placeholder="+63 912 345 6789"
                            className={inputClasses}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Business Details ─── */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-sky-400" />
                      </div>
                      <h3 className="text-sm font-black tracking-tight text-[var(--text-primary)]">
                        Business Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Store Name <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="text"
                            name="storeName"
                            required
                            placeholder="e.g., Baguio Hyperlocal Traders"
                            value={formData.storeName}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Business Email{" "}
                          <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="email"
                            name="businessEmail"
                            required
                            placeholder="business@domain.com"
                            value={formData.businessEmail}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Business Phone{" "}
                          <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <input
                            type="tel"
                            name="businessPhone"
                            required
                            placeholder="+63 912 345 6789"
                            value={formData.businessPhone}
                            onChange={handleInputChange}
                            readOnly={Boolean(registration)}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Seller Plan <span className="text-cyan-400">*</span>
                        </label>
                        <div className="relative">
                          <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                          <select
                            name="sellerPlan"
                            required
                            value={formData.sellerPlan}
                            onChange={handleInputChange}
                            disabled={Boolean(registration)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)]/20 focus:border-[var(--brand-core)] transition-all duration-200 cursor-pointer appearance-none"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m2 4 4 4 4-4'/%3E%3C/svg%3E\")",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.875rem center",
                            }}
                          >
                            <option value="" disabled>
                              Select a plan...
                            </option>
                            <option value="free">Free</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Agent Notes ─── */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-black tracking-tight text-[var(--text-primary)]">
                        Agent Notes
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        name="agentNotes"
                        rows={3}
                        value={formData.agentNotes}
                        onChange={handleInputChange}
                        readOnly={Boolean(registration)}
                        placeholder="Internal notes regarding this seller..."
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-core)]/20 focus:border-[var(--brand-core)] transition-all duration-200 resize-none"
                      />
                      <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                        <BadgeCheck className="w-3 h-3 text-amber-400/60" />
                        These notes are internal only and will not be visible to
                        the seller.
                      </p>
                    </div>
                  </div>

                  {/* ─── Submit Button ─── */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isRegistering}
                      disabled={isRegistering}
                      className="!h-12 text-sm font-extrabold rounded-xl shadow-lg shadow-[var(--brand-core)]/25 hover:shadow-xl hover:shadow-[var(--brand-core)]/30 transition-all"
                    >
                      {registration ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      {registration
                        ? "Continue to Credentials"
                        : "Register Seller"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
