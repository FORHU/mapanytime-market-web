"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignInPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-text-secondary font-medium">
          Enter your credentials to manage your store layout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
            Email Address
          </label>
          <input
            type="email"
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
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl glass border-white/10 bg-white/5 focus:outline-none focus:border-brand-core transition-colors font-medium text-sm text-text-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-core/20"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-sm text-text-tertiary text-center font-medium">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="text-brand-light hover:underline font-bold"
        >
          Get Started
        </Link>
      </p>
    </div>
  );
}
