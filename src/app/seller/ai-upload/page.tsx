"use client";

import React from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sparkles, Keyboard, Wand2 } from "lucide-react";

export default function AiUploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Intake Pipeline"
        description="Process catalog elements using automated text extraction, or input structured specifications manually."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-dashed flex flex-col items-center text-center justify-center py-12">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <Wand2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">AI Automated Parsing</h3>
          <p
            className="text-[11px] max-w-xs mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Drop invoices, item manifest tables, or product charts to parse
            descriptive datasets instantly.
          </p>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
            Initialize Scan
          </button>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center justify-center py-12">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            <Keyboard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">Manual Manifest Key-In</h3>
          <p
            className="text-[11px] max-w-xs mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Draft clean catalog metrics, custom pricing rules, and item
            descriptions manually.
          </p>
          <button
            className="px-3 py-1.5 text-xs font-bold border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
            style={{ borderColor: "var(--border-light)" }}
          >
            Open Data Form
          </button>
        </Card>
      </div>
    </div>
  );
}
