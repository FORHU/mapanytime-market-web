"use client";

import { useState } from "react";
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  MapPin,
  ExternalLink,
  Plus,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

export default function AdminStoresPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [stores, setStores] = useState([
    {
      id: "st_01",
      name: "Organic Harvest Market",
      owner: "Elena Rostova",
      email: "elena@organicharvest.com",
      phone: "+1 (555) 234-5678",
      category: "Grocery & Fresh Produce",
      address: "742 Evergreen Terrace, Sector 4",
      status: "PENDING",
      productsCount: 48,
      rating: 4.8,
      createdAt: "2026-07-26",
    },
    {
      id: "st_02",
      name: "Metro Artisan Bakery",
      owner: "Marco Silva",
      email: "marco@metrobakery.io",
      phone: "+1 (555) 876-5432",
      category: "Bakery & Desserts",
      address: "1088 Artisan Way, Downtown",
      status: "PENDING",
      productsCount: 19,
      rating: 4.9,
      createdAt: "2026-07-25",
    },
    {
      id: "st_03",
      name: "CyberGadget Hub",
      owner: "Kenji Sato",
      email: "kenji@cybergadgets.jp",
      phone: "+1 (555) 432-1098",
      category: "Electronics & Tech",
      address: "42 Neon Strip, District 9",
      status: "PENDING",
      productsCount: 65,
      rating: 4.7,
      createdAt: "2026-07-24",
    },
    {
      id: "st_04",
      name: "Downtown Coffee Roasters",
      owner: "Sarah Jenkins",
      email: "sarah@downtowncoffee.com",
      phone: "+1 (555) 998-1122",
      category: "Café & Coffee",
      address: "12 Central Square",
      status: "VERIFIED",
      productsCount: 32,
      rating: 4.9,
      createdAt: "2026-06-15",
    },
    {
      id: "st_05",
      name: "Urban Craft Apparel",
      owner: "David Miller",
      email: "david@urbancraft.co",
      phone: "+1 (555) 334-7788",
      category: "Fashion & Apparel",
      address: "505 Fashion Boulevard",
      status: "VERIFIED",
      productsCount: 112,
      rating: 4.6,
      createdAt: "2026-05-10",
    },
  ]);

  const handleApprove = (id: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "VERIFIED" } : s)),
    );
  };

  const handleReject = (id: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "REJECTED" } : s)),
    );
  };

  const filteredStores = stores.filter((store) => {
    const matchesTab = activeTab === "ALL" || store.status === activeTab;
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[var(--brand-core)]" />
            Store Management & Approvals
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Review seller store registration requests, verify physical shop
            credentials, and manage active marketplace merchants.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-2xl bg-[var(--brand-core)] hover:bg-sky-400 text-white font-bold text-sm shadow-md flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Merchant Store
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === "ALL"
                ? "bg-[var(--brand-core)] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
            }`}
          >
            All Stores ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-amber-500 text-white shadow-md"
                : "text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending (
            {stores.filter((s) => s.status === "PENDING").length})
          </button>
          <button
            onClick={() => setActiveTab("VERIFIED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === "VERIFIED"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified (
            {stores.filter((s) => s.status === "VERIFIED").length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search stores or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-core)]"
          />
        </div>
      </div>

      {/* Stores List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-sky-500/40 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
                {store.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {store.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      store.status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : store.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {store.status === "VERIFIED" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {store.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] flex-wrap">
                  <span className="font-semibold text-cyan-400">
                    {store.category}
                  </span>
                  <span>•</span>
                  <span>
                    Owner:{" "}
                    <strong className="text-[var(--text-secondary)]">
                      {store.owner}
                    </strong>{" "}
                    ({store.email})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{store.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border-light)] justify-end">
              {store.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleApprove(store.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Store
                  </button>
                  <button
                    onClick={() => handleReject(store.id)}
                    className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {store.status === "VERIFIED" && (
                <button
                  onClick={() => handleReject(store.id)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:bg-rose-500/10 text-xs font-bold text-rose-400 transition-colors"
                >
                  Suspend Store
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
