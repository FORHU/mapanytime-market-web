"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, CheckCircle } from "lucide-react";
import AuthLayout from "@/shared/components/AuthLayout"; // Import layout

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState(
    "6603610c6c20fa2e1ed93c51110bd06a.jpg",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting image documentation...");

    // Redirects to your check-gate middleware route
    router.push("/auth");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Step Info Counter header element */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verify Identity
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload verification documents for your buyer access.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
            Step 2 of 2
          </span>
        </div>

        {/* BACK ACTION LINK */}
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors w-fit group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Profile Info
        </Link>

        {/* Verification submission container form wrapper */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              REQUIRED IMAGE DOCUMENTS
            </label>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Verify ID (Valid Government ID)
              </span>

              {/* Custom file item layout strip */}
              <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 font-mono font-medium truncate">
                    {fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("File uploader trigger point.")}
                  className="text-xs font-black text-slate-900 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* MAIN SUBMIT ACTION BUTTON */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-950 hover:from-slate-900 hover:to-black text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Submit Registration Layout</span>
            <CheckCircle className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
