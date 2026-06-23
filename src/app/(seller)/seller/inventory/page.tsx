"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Minus, Circle } from "lucide-react";

const initialInventory = [
  {
    name: "Organic Mixed Vegetable Bundle",
    sku: "SKU-VEG-001",
    stock: 24,
    reorder: 10,
    sold: 18,
    status: "OK",
  },
  {
    name: "Local Honey 500ml",
    sku: "SKU-HON-002",
    stock: 12,
    reorder: 15,
    sold: 14,
    status: "Low",
  },
  {
    name: "Dragon Fruit Pack 1kg",
    sku: "SKU-DRG-003",
    stock: 0,
    reorder: 10,
    sold: 12,
    status: "Out",
  },
  {
    name: "Cassava Chips 200g",
    sku: "SKU-CHI-004",
    stock: 88,
    reorder: 20,
    sold: 40,
    status: "OK",
  },
  {
    name: "Fresh Coconut Water 1L",
    sku: "SKU-COC-005",
    stock: 6,
    reorder: 20,
    sold: 22,
    status: "Low",
  },
  {
    name: "Sambal Terasi 250g",
    sku: "SKU-SAM-006",
    stock: 20,
    reorder: 10,
    sold: 0,
    status: "OK",
  },
];

const historyLogs = [
  {
    type: "Sold",
    name: "Organic Veg Bundle",
    date: "Jun 17",
    val: "-2",
    color: "text-rose-600 bg-slate-100",
  },
  {
    type: "Restocked",
    name: "Dragon Fruit Pack",
    date: "Jun 17",
    val: "+30",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    type: "Sold",
    name: "Local Honey 500ml",
    date: "Jun 16",
    val: "-3",
    color: "text-rose-600 bg-slate-100",
  },
  {
    type: "Sold",
    name: "Cassava Chips 200g",
    date: "Jun 16",
    val: "-8",
    color: "text-rose-600 bg-slate-100",
  },
  {
    type: "Expired Removed",
    name: "Fresh Coconut Water",
    date: "Jun 15",
    val: "-6",
    color: "text-rose-600 bg-rose-50 border-rose-100",
  },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            {inventory.length} products tracked
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-xs font-bold shadow-xs">
          <AlertTriangle className="w-4 h-4 text-orange-500 fill-orange-50" />3
          items need attention
        </div>
      </div>

      {/* Main Workspace Split Grid Layout */}
      <div className="grid xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Dynamic Tracked Table Panel */}
        <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-5">Product</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Reorder At</th>
                  <th className="py-4 px-4">Sold (7d)</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-center">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {inventory.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="py-4 px-5 text-slate-900 font-bold tracking-tight flex items-center gap-2">
                      {item.status !== "OK" && (
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      )}
                      {item.name}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono font-medium">
                      {item.sku}
                    </td>
                    <td className="py-4 px-4 text-slate-900 text-sm font-black">
                      {item.stock}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-medium">
                      {item.reorder}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold flex items-center gap-1">
                      <span className="text-orange-500 text-[10px]">↳</span>{" "}
                      {item.sold}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide ${
                          item.status === "OK"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : item.status === "Low"
                              ? "bg-orange-50 text-orange-700 border border-orange-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1 bg-slate-50 border border-slate-200/60 p-0.5 rounded-lg w-fit mx-auto">
                        <button className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-all">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold">
                          +10
                        </span>
                        <button className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-all">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Timeline Inventory History Module Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Inventory History
          </h3>

          <div className="space-y-3.5">
            {historyLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-slate-50 last:border-none pb-3 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${log.color}`}
                  >
                    {log.val.startsWith("+") ? "＋" : "－"}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 leading-none">
                      {log.type}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {log.name} · <span className="font-mono">{log.date}</span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-black ${log.val.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {log.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
