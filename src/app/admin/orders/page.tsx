"use client";

// MOCK DATA - the orders array below is hardcoded. /v1/orders/store exists and
// shared/hooks/useOrdersPipeline.ts already calls it on the seller side.
// See docs/connection-audit.md §7.
import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  QrCode,
  DollarSign,
  MapPin,
  Calendar,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: "ORD-9482",
      store: "Downtown Coffee Roasters",
      buyer: "Sarah Jenkins",
      buyerPhone: "+1 (555) 123-9900",
      amount: "$42.50",
      paymentMethod: "CASH_ON_DELIVERY",
      type: "PICKUP",
      pickupAt: "2026-07-27 14:30",
      status: "COMPLETED",
      items: ["Artisanal Espresso Beans 500g (x2)", "Cold Brew Bottle 1L (x1)"],
    },
    {
      id: "ORD-9481",
      store: "Organic Harvest Market",
      buyer: "Alex Chen",
      buyerPhone: "+1 (555) 443-8811",
      amount: "$118.00",
      paymentMethod: "GCASH",
      type: "DELIVERY",
      pickupAt: "N/A (Delivery)",
      status: "PROCESSING",
      items: ["Fresh Hydroponic Kale (x3)", "Organic Avocado Box (x1)"],
    },
    {
      id: "ORD-9480",
      store: "Urban Craft Apparel",
      buyer: "David Miller",
      buyerPhone: "+1 (555) 776-2233",
      amount: "$85.90",
      paymentMethod: "BANK",
      type: "PICKUP",
      pickupAt: "2026-07-27 17:00",
      status: "PENDING",
      items: ["Cyberpunk Denim Jacket (x1)"],
    },
    {
      id: "ORD-9479",
      store: "Metro Artisan Bakery",
      buyer: "Elena Rostova",
      buyerPhone: "+1 (555) 998-3344",
      amount: "$36.00",
      paymentMethod: "CASH_ON_DELIVERY",
      type: "PICKUP",
      pickupAt: "2026-07-27 11:00",
      status: "CANCELLED",
      items: ["Sourdough Bread Loaf (x2)", "Almond Croissants (x4)"],
    },
  ];

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
    const matchesSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      ord.store.toLowerCase().includes(search.toLowerCase()) ||
      ord.buyer.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[var(--brand-core)]" />
            Platform Order Oversight
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Monitor real-time buyer order volume, pickup timestamps, inventory
            reservations, and payment settlements across all active stores.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  statusFilter === st
                    ? "bg-[var(--brand-core)] text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                }`}
              >
                {st} (
                {st === "ALL"
                  ? orders.length
                  : orders.filter((o) => o.status === st).length}
                )
              </button>
            ),
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search order ID, store, or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-4 hover:border-sky-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-lg text-sky-400">
                  {ord.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {ord.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {ord.paymentMethod}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    ord.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : ord.status === "PROCESSING"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        : ord.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {ord.status}
                </span>
                <span className="text-xl font-black text-[var(--text-primary)]">
                  {ord.amount}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Merchant Store:
                </span>
                <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">
                  {ord.store}
                </p>
              </div>

              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Buyer Info:
                </span>
                <p className="font-bold text-[var(--text-primary)] text-sm mt-0.5">
                  {ord.buyer}
                </p>
                <p className="text-[var(--text-tertiary)]">{ord.buyerPhone}</p>
              </div>

              <div>
                <span className="text-[var(--text-tertiary)] font-medium">
                  Scheduled Pickup Time:
                </span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">
                  {ord.pickupAt}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>
                Items:{" "}
                <strong className="text-[var(--text-secondary)]">
                  {ord.items.join(", ")}
                </strong>
              </span>
              <button className="text-sky-400 font-bold hover:underline">
                View QR Payload & Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
