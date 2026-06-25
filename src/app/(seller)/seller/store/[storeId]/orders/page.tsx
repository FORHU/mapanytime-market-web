"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Clock,
  ShoppingBag,
  CheckCircle2,
  Truck,
  ArrowRight,
  Eye,
} from "lucide-react";

interface OrderItem {
  id: string;
  buyer: string;
  item: string;
  amount: string;
  status: "Pending" | "Preparing" | "Ready" | "Delivered";
  time: string;
  type: "Pickup" | "Delivery";
}

export default function OrdersPage() {
  const params = useParams();
  const storeId = (params.storeId as string) || "STORE-9921";

  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // Simulated multi-store data mapping matrix mirroring your business branch profiles
  useEffect(() => {
    const mockDbOrders: Record<string, OrderItem[]> = {
      "STORE-9921": [
        {
          id: "ORD-8900",
          buyer: "Mark Tan",
          item: "Bulalo Family Size × 1",
          amount: "₱450",
          status: "Pending",
          time: "5m ago",
          type: "Pickup",
        },
        {
          id: "ORD-8895",
          buyer: "Siti Rahayu",
          item: "Sizzling Sisig × 1",
          amount: "₱220",
          status: "Preparing",
          time: "18m ago",
          type: "Pickup",
        },
        {
          id: "ORD-8890",
          buyer: "Ahmad Fauzi",
          item: "Lechon Kawali × 2",
          amount: "₱560",
          status: "Ready",
          time: "42m ago",
          type: "Pickup",
        },
        {
          id: "ORD-8881",
          buyer: "Dewi Lestari",
          item: "Pinakbet × 1",
          amount: "₱150",
          status: "Delivered",
          time: "1h ago",
          type: "Pickup",
        },
      ],
      "STORE-4401": [
        {
          id: "ORD-4401",
          buyer: "Alice Villa",
          item: "Beachside Cocktail Pitcher × 2",
          amount: "₱1,300",
          status: "Pending",
          time: "12m ago",
          type: "Pickup",
        },
        {
          id: "ORD-4402",
          buyer: "John Doe",
          item: "Grilled Seafood Platter × 1",
          amount: "₱4,800",
          status: "Preparing",
          time: "45m ago",
          type: "Delivery",
        },
        {
          id: "ORD-4403",
          buyer: "Clara Smith",
          item: "Crispy Calamari Basket × 1",
          amount: "₱320",
          status: "Delivered",
          time: "3h ago",
          type: "Pickup",
        },
      ],
      "STORE-1120": [
        {
          id: "ORD-1101",
          buyer: "Dave Agpaoa",
          item: "Mechanical Gaming Keyboard × 1",
          amount: "₱2,450",
          status: "Preparing",
          time: "2h ago",
          type: "Pickup",
        },
        {
          id: "ORD-1102",
          buyer: "Janice Lua",
          item: "RGB Desk Mat Extra Large × 2",
          amount: "₱1,200",
          status: "Delivered",
          time: "1d ago",
          type: "Delivery",
        },
      ],
      "STORE-8873": [
        {
          id: "ORD-8801",
          buyer: "Maria Luisa",
          item: "Premium Jasmine Rice 25kg × 2",
          amount: "₱2,900",
          status: "Pending",
          time: "1m ago",
          type: "Delivery",
        },
        {
          id: "ORD-8802",
          buyer: "Kevin Reyes",
          item: "Native Benguet Coffee Beans × 3",
          amount: "₱600",
          status: "Pending",
          time: "4m ago",
          type: "Pickup",
        },
        {
          id: "ORD-8803",
          buyer: "Liezl Ramos",
          item: "Fresh Baguio Strawberries 1kg × 5",
          amount: "₱1,750",
          status: "Ready",
          time: "22m ago",
          type: "Pickup",
        },
      ],
    };

    setOrders(mockDbOrders[storeId] || []);
  }, [storeId]);

  // Compute operational counter metrics dynamically
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const activeProcessingCount = orders.filter(
    (o) => o.status === "Preparing" || o.status === "Ready",
  ).length;

  const filteredOrders = orders.filter(
    (order) =>
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── HEADER LAYOUT FRAME ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Orders Queue
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Manage incoming live fulfillment sequences, accept handoffs, and
            track customer pickups.
          </p>
        </div>
      </div>

      {/* ── OPERATIONAL STATUS METRICS OVERVIEW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {totalOrders}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Total Orders Logged
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {pendingCount}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Awaiting Acceptance
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {activeProcessingCount}
            </h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              In Preparation / Ready
            </p>
          </div>
        </div>
      </div>

      {/* ── FILTER FILTER SEARCH WRAPPER ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order identifier, product details, or buyer name..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition-all w-full md:w-auto justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Parameters
        </button>
      </div>

      {/* ── ORDERS DATAGRID TABLE LAYER ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Line Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Fulfillment Mode</th>
                <th className="py-3.5 px-4">Status Tag</th>
                <th className="py-3.5 px-4">Timeline</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="py-4 px-6 font-black text-slate-900 text-sm">
                    {order.id}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600">
                    {order.buyer}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">
                    {order.item}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-emerald-600 font-mono text-sm">
                    {order.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-[11px] font-bold ${order.type === "Pickup" ? "text-slate-600" : "text-purple-600"}`}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${
                        order.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : order.status === "Preparing"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : order.status === "Ready"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono font-medium">
                    {order.time}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-[11px] font-bold">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-xs font-bold text-slate-400 italic bg-white">
            No incoming order logs match your current query parameter
            constraints.
          </div>
        )}
      </div>
    </div>
  );
}
