"use client";

export default function SellerOrdersPage() {
  const orders = [
    {
      id: "ORD-8900",
      buyer: "Budi Santoso",
      item: "Organic Veg Bundle × 2",
      amount: "₱25.00",
      status: "Pending",
      type: "Rider",
      time: "5m ago",
    },
    {
      id: "ORD-8895",
      buyer: "Siti Rahayu",
      item: "Local Honey 500ml × 1",
      amount: "₱14.00",
      status: "Preparing",
      type: "Pickup",
      time: "18m ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          {orders.length} actions remaining
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500">
              <th className="p-4">ORDER ID</th>
              <th className="p-4">BUYER</th>
              <th className="p-4">PRODUCT</th>
              <th className="p-4">AMOUNT</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-slate-100 last:border-none font-medium text-slate-700 hover:bg-slate-50/50"
              >
                <td className="p-4 font-bold text-slate-900">{o.id}</td>
                <td className="p-4">{o.buyer}</td>
                <td className="p-4 text-slate-500">{o.item}</td>
                <td className="p-4 font-bold text-emerald-600">{o.amount}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${o.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="px-3 py-1.5 bg-slate-950 text-white rounded-lg font-bold text-[11px] hover:bg-slate-800 transition-colors">
                    Mark as Ready
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
