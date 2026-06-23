"use client";

import React from "react";
import {
  MapPin,
  Phone,
  Clock,
  PenTool,
  Package,
  Users,
  Star,
} from "lucide-react";

export default function StoreProfile() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-sans antialiased text-[#111111]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Store Profile
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              How buyers see your store on the map
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm">
            <PenTool className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Hero Banner Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-44 bg-gradient-to-r from-[#112240] via-[#1F4056] to-[#10B981]" />

          {/* Profile Details Bar */}
          <div className="px-6 pb-6 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4 -mt-8 sm:-mt-10">
              {/* KS Avatar Badge */}
              <div className="w-20 h-20 bg-[#10B981] border-4 border-white text-white font-bold text-2xl flex items-center justify-center rounded-2xl shadow-sm z-10">
                KS
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Kedai Bu Sari
                </h2>
                <p className="text-sm text-[#64748B] font-medium">
                  Groceries & Fresh Produce
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D1FAE5]">
                Verified ✓
              </span>
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D1FAE5]">
                Live on Map
              </span>
            </div>
          </div>
        </div>

        {/* 4-Column Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Products */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#EEFDF6] text-[#10B981] rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">142</p>
              <p className="text-xs font-medium text-[#94A3B8]">Products</p>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#EFF6FF] text-[#3B82F6] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">1,248</p>
              <p className="text-xs font-medium text-[#94A3B8]">
                Total Customers
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FFFBEB] text-[#F59E0B] rounded-xl">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">4.7 ★</p>
              <p className="text-xs font-medium text-[#94A3B8]">Rating</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FFF7ED] text-[#F97316] rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">0.4 km</p>
              <p className="text-xs font-medium text-[#94A3B8]">Location</p>
            </div>
          </div>
        </div>

        {/* Two-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Block: Store Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#0F172A]">
              Store Details
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Tagline
                </span>
                <p className="text-sm text-[#334155]">
                  Fresh from our kitchen to your table, every day
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Address
                </span>
                <div className="flex items-start gap-2 text-sm text-[#334155] mt-0.5">
                  <MapPin className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
                  <span>Jl. Kemang Raya No. 42, Jakarta Selatan</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Phone
                </span>
                <div className="flex items-center gap-2 text-sm text-[#334155] mt-0.5">
                  <Phone className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>+62 812-3456-7890</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Operating Hours
                </span>
                <div className="flex items-center gap-2 text-sm text-[#334155] mt-0.5">
                  <Clock className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>07:00 – 20:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: About & Map Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] mb-3">
                About the Store
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Family-owned neighborhood store serving the Kemang community
                since 2018. We source directly from local farms and prepare
                homemade condiments daily. No preservatives, no shortcuts.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                Map Pin Preview
              </h3>
              {/* Simulated Map Container */}
              <div className="bg-[#172237] rounded-xl h-40 flex items-center justify-center relative overflow-hidden">
                {/* Custom Map Pill */}
                <div className="flex items-center gap-1.5 bg-[#10B981] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#34D399]">
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                  <span>Kedai Bu Sari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
