"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  Upload,
  FileText,
  CheckCircle2,
} from "lucide-react";

type Role = "buyer" | "seller" | null;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(null);

  // Form profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Uploaded files storage
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    mayorsPermit: null,
    dti: null,
    tin: null,
    verifyId: null,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Final sign up + file dispatch integration logic goes here
    console.log("Submitting:", { name, email, password, role, files });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic step header tracking */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {step === 1 ? "Create Account" : "Verify Identity"}
          </h1>
          <p className="text-sm text-text-secondary font-medium">
            {step === 1
              ? "Set up your credentials and account role profile."
              : `Upload verification documents for your ${role} access.`}
          </p>
        </div>
        <span className="text-xs font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-text-tertiary">
          Step {step} of 2
        </span>
      </div>

      {/* ── STEP 1: ACCOUNT PROFILE SETUP ─────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                role === "buyer"
                  ? "border-brand-core bg-brand-core/10 glow-primary"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <User
                className={`w-6 h-6 ${role === "buyer" ? "text-brand-light" : "text-text-secondary"}`}
              />
              <span className="text-sm font-bold">Buyer Account</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                role === "seller"
                  ? "border-brand-core bg-brand-core/10 glow-primary"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <Store
                className={`w-6 h-6 ${role === "seller" ? "text-brand-light" : "text-text-secondary"}`}
              />
              <span className="text-sm font-bold">Seller Account</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl glass border-white/10 bg-white/5 focus:outline-none focus:border-brand-core transition-colors font-medium text-sm text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl glass border-white/10 bg-white/5 focus:outline-none focus:border-brand-core transition-colors font-medium text-sm text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl glass border-white/10 bg-white/5 focus:outline-none focus:border-brand-core transition-colors font-medium text-sm text-text-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!role}
            className="w-full py-3.5 mt-2 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-core/20"
          >
            Continue to Verification
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ── STEP 2: DYNAMIC DOCUMENT UPLOADING PAGE ─────────────────── */}
      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors group mb-2"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to Profile Info
          </button>

          <div className="space-y-4 bg-white/5 border border-white/5 p-5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              Required PDF Documents
            </h3>

            {/* Seller Upload Fields */}
            {role === "seller" && (
              <>
                <FileUploader
                  label="Mayor's Permit"
                  id="mayorsPermit"
                  file={files.mayorsPermit}
                  onChange={(e) => handleFileChange(e, "mayorsPermit")}
                />
                <FileUploader
                  label="DTI Certification"
                  id="dti"
                  file={files.dti}
                  onChange={(e) => handleFileChange(e, "dti")}
                />
                <FileUploader
                  label="TIN Verification Document"
                  id="tin"
                  file={files.tin}
                  onChange={(e) => handleFileChange(e, "tin")}
                />
              </>
            )}

            {/* Verification element shared by both Roles */}
            <FileUploader
              label="Verify ID (Valid Government ID)"
              id="verifyId"
              file={files.verifyId}
              onChange={(e) => handleFileChange(e, "verifyId")}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-core/20"
          >
            Submit Registration Layout
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 1 && (
        <p className="text-sm text-text-tertiary text-center font-medium">
          Already have an account?{" "}
          <Link
            href="/auth"
            className="text-brand-light hover:underline font-bold"
          >
            Sign In
          </Link>
        </p>
      )}
    </div>
  );
}

/* ── Custom Component UI for PDF Upload Items ── */
interface UploaderProps {
  label: string;
  id: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploader({ label, id, file, onChange }: UploaderProps) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-wide text-text-tertiary mb-1.5">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border border-dashed transition-all cursor-pointer text-sm font-medium ${
          file
            ? "border-brand-core/40 bg-brand-core/5 text-text-primary"
            : "border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary"
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-[80%]">
          {file ? (
            <>
              <FileText className="w-4 h-4 text-brand-light flex-shrink-0 animate-bounce" />
              <span className="text-text-primary text-xs truncate font-semibold">
                {file.name}
              </span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-text-tertiary flex-shrink-0" />
              <span className="text-text-tertiary text-xs">
                Upload PDF format...
              </span>
            </>
          )}
        </div>
        <span className="text-xs font-bold text-brand-light bg-brand-core/10 px-2.5 py-1 rounded">
          {file ? "Replace" : "Browse"}
        </span>
      </label>
      <input
        type="file"
        id={id}
        accept=".pdf"
        onChange={onChange}
        className="hidden"
        required={!file}
      />
    </div>
  );
}
