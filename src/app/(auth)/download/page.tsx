"use client";

import React from "react";
import { Smartphone, Download, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MobileRedirectPage() {
  // Replace this placeholder link string with your actual cloud deployment storage bucket link (S3, Firebase Storage, etc.)
  const APK_DOWNLOAD_URL =
    "https://storage.mapanytime.com/releases/mapanytime-buyer-latest.apk";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 antialiased font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Branding Icon Grid Display Container */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Smartphone className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Download the Buyer App
          </h1>
          <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
            Are you looking for products nearby? The MapAnytime customer
            marketplace experience runs exclusively inside our dedicated mobile
            application.
          </p>
        </div>

        {/* High-Fidelity Call-To-Action Execution Widget Link Block */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center space-y-4">
          <a
            href={APK_DOWNLOAD_URL}
            download
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-xs group"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            Get MapAnytime Android Build (.APK)
          </a>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Package
            Verification Signed
          </span>
        </div>

        {/* Back navigation link footer path parameters adjustment */}
        <div className="pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Merchant Log In
            portal
          </Link>
        </div>
      </div>
    </div>
  );
}
