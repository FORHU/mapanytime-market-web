"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getOrders } from "@/features/orders/api/orders.api";
import { Card, Badge } from "@/shared/components";

interface Order {
  id: string;
  buyer: string;
  item: string;
  amount: number;
  status: string;
  type: string;
}

export default function OrdersPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (storeId) {
      getOrders(storeId)
        .then((data) => setOrders(data?.orders || data || []))
        .catch((err) => console.error(err));
    }
  }, [storeId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Live Orders Matrix</h1>
      <Card
        variant="outlined"
        padding="none"
        className="!rounded-3xl overflow-hidden shadow-xs"
      >
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="py-4 px-6 text-slate-900">{order.id}</td>
                <td className="py-4 px-4 text-slate-600">{order.buyer}</td>
                <td className="py-4 px-4 text-slate-500 font-medium">
                  {order.item}
                </td>
                <td className="py-4 px-4 text-emerald-600 font-mono">
                  ₱{order.amount}
                </td>
                <td className="py-4 px-4">
                  <Badge variant="warning" size="sm">
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
