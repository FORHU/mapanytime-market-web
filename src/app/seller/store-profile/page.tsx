"use client";

import React from "react";
import { Card } from "@/shared/components/ui/Card";
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export default function StoreProfilePage() {
  // Mock data representing the currently active store from your header state
  const storeInfo = {
    name: "MapCentral Groceries Node Alpha",
    id: "STR-NODE-9921",
    email: "ops@mapcentralgroceries.io",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Sector 7G",
    joinedDate: "October 14, 2025",
    status: "Active & Synced",
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pt-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Storefront Registry Profile
        </h1>
        <p className="text-xs text-zinc-400">
          Manage digital consumer channel identity configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side Branding Card */}
        <Card className="p-6 flex flex-col items-center text-center justify-center space-y-4 border-[var(--border-default)]">
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[var(--brand-core)]">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)]">
              {storeInfo.name}
            </h2>
            <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-0.5">
              {storeInfo.id}
            </p>
          </div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50/50 border border-emerald-200 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> {storeInfo.status}
          </span>
        </Card>

        {/* Right Side Detail Matrix */}
        <Card className="p-6 md:col-span-2 space-y-4 border-[var(--border-default)]">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b pb-2 border-[var(--border-light)]">
            Operational Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Support Dispatch Email
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {storeInfo.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Direct Terminal Hotline
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {storeInfo.phone}
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Physical Mapping Anchor
              </span>
              <p className="font-medium text-[var(--text-primary)]">
                {storeInfo.address}
              </p>
            </div>

            <div className="space-y-1 border-t pt-3 sm:col-span-2 border-[var(--border-light)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Deployment Timestamp
              </span>
              <p className="font-medium text-zinc-400">
                {storeInfo.joinedDate}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
