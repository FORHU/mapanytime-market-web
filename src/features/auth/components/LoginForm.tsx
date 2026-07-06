"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card } from "@/shared/components/ui/Card";
import { LogIn, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginForm({
  onLoginSuccess,
}: {
  onLoginSuccess: (role: string) => void;
}) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ⚡ Simulating Authentication Service Execution Chain
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Authenticated Secure Parameters:", credentials);

      // Simulated role extraction from JWT claims (Hardcoded to seller for dashboard routing)
      onLoginSuccess("seller");
    }, 1200);
  };

  return (
    <Card className="p-6 max-w-md w-full mx-auto text-left shadow-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center mb-3">
          <LogIn className="w-4 h-4" />
        </div>
        <h2 className="text-base font-black tracking-tight">
          Welcome Back to MapAnytime
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Access your merchant portal or buyer credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="email"
              name="email"
              required
              placeholder="name@domain.com"
              value={credentials.email}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-background focus:outline-none"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <a
              href="#forgot"
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Forgot?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              className="w-full pl-9 pr-10 py-2 border rounded-xl text-xs bg-background focus:outline-none"
              style={{ borderColor: "var(--border-light)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 mt-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Verifying Session..." : "Secure Sign In"}
        </button>
      </form>

      <div className="mt-4 text-center text-[11px] text-zinc-400">
        {"Don't have an account?"}
        <Link
          href="/register"
          className="font-bold underline text-zinc-600 dark:text-zinc-200 hover:opacity-80"
        >
          Create account
        </Link>
      </div>
    </Card>
  );
}
