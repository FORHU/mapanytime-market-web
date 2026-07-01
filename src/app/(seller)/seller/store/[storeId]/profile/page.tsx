"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getStoreProfile } from "@/features/seller/api/stores.api";
import {
  MapPin,
  Phone,
  Clock,
  PenTool,
  Package,
  Users,
  Star,
  Loader2,
} from "lucide-react";

interface StoreProfileData {
  name: string;
  category: string;
  tagline?: string;
  address: string;
  phone: string;
  operatingHours: string;
  about?: string;
  metrics: {
    productsCount: number;
    totalCustomers: number;
    rating: number;
    distance?: string;
  };
}

export default function StoreProfile() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [profile, setStoreProfile] = useState<StoreProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    const fetchStoreProfile = async () => {
      setIsLoading(true);
      try {
        const dbData = await getStoreProfile(storeId);

        // Handle database wrapper schema parsing safely
        const innerData = dbData?.data || dbData;

        setStoreProfile({
          name: innerData.name || "Active Merchant",
          category: innerData.category || "Local Marketplace Vendor",
          tagline: innerData.tagline || "Freshly pinned local items near you.",
          address: innerData.address || "No structural location defined.",
          phone: innerData.phone || "No contact line associated.",
          operatingHours:
            innerData.operatingHours || innerData.hours || "08:00 - 17:00",
          about:
            innerData.about ||
            "Hyperlocal neighborhood merchant verified on the MapAnytime network registry system.",
          metrics: {
            productsCount:
              innerData.metrics?.productsCount ??
              innerData.products?.length ??
              0,
            totalCustomers: innerData.metrics?.totalCustomers ?? 0,
            rating: innerData.metrics?.rating ?? 5.0,
            distance: innerData.metrics?.distance ?? "0.0 km",
          },
        });
      } catch (err) {
        console.error("Profile synchronization failure:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreProfile();
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xs font-bold text-slate-400 gap-2 bg-[#FAFAFA]">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span>Parsing dynamic metadata mapping attributes...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-400 italic bg-[#FAFAFA]">
        Could not construct store profile template context for identifier code:{" "}
        {storeId}
      </div>
    );
  }

  // Get initials for custom profile avatar thumbnail placeholder
  const avatarInitials = profile.name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-sans antialiased text-[#111111] animate-in fade-in duration-300">
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
          <button className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm cursor-pointer">
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
              {/* Avatar Badge */}
              <div className="w-20 h-20 bg-[#10B981] border-4 border-white text-white font-bold text-2xl flex items-center justify-center rounded-2xl shadow-sm z-10 font-mono">
                {avatarInitials}
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-sm text-[#64748B] font-medium">
                  {profile.category}
                </p>
              </div>
            </div>

            {/* Verification Status Tags */}
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

        {/* 4-Column Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Products Count */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#EEFDF6] text-[#10B981] rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">
                {profile.metrics.productsCount}
              </p>
              <p className="text-xs font-medium text-[#94A3B8]">Products</p>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#EFF6FF] text-[#3B82F6] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">
                {profile.metrics.totalCustomers.toLocaleString()}
              </p>
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
              <p className="text-lg font-bold text-[#0F172A] font-mono">
                {profile.metrics.rating.toFixed(1)} ★
              </p>
              <p className="text-xs font-medium text-[#94A3B8]">Rating</p>
            </div>
          </div>

          {/* Local Proximity Metric */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FFF7ED] text-[#F97316] rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">
                {profile.metrics.distance}
              </p>
              <p className="text-xs font-medium text-[#94A3B8]">
                Location Proximity
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Details Layout Block */}
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
                <p className="text-sm text-[#334155] font-medium leading-relaxed">
                  {profile.tagline}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Address Mapping
                </span>
                <div className="flex items-start gap-2 text-sm text-[#334155] mt-0.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
                  <span>{profile.address}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Contact Phone
                </span>
                <div className="flex items-center gap-2 text-sm text-[#334155] mt-0.5 font-mono">
                  <Phone className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                  Operating Timeline
                </span>
                <div className="flex items-center gap-2 text-sm text-[#334155] mt-0.5 font-medium">
                  <Clock className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>{profile.operatingHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: About & Hyperlocal Pin Layout Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] mb-3">
                About the Store
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed font-medium">
                {profile.about}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                Map Location Preview
              </h3>

              {/* Canvas Layout Simulation Container */}
              <div className="bg-[#172237] rounded-xl h-40 flex items-center justify-center relative overflow-hidden">
                {/* Dynamic Floating Visual Pin */}
                <div className="flex items-center gap-1.5 bg-[#10B981] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#34D399] animate-bounce">
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                  <span>{profile.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
