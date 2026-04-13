"use client";

import { useEffect, useState } from "react";
import type { CompletedOrder } from "@/app/pos/context/OrderHistoryContext";

export function useManagerDashboard() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/orders`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Manager API Error:", err);
      }
    }
    if (API_URL) load();
  }, [API_URL]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.timestamp) >= today);

  return {
    todayOrders,
    totalSales: todayOrders.reduce((sum, o) => sum + o.total, 0),
    totalOrders: todayOrders.length,
    avgOrderValue: todayOrders.length > 0 ? todayOrders.reduce((sum, o) => sum + o.total, 0) / todayOrders.length : 0,
    cashSales: todayOrders.filter(o => o.paymentType === "cash").reduce((s, o) => s + o.total, 0),
    cardSales: todayOrders.filter(o => o.paymentType !== "cash").reduce((s, o) => s + o.total, 0),
  };
}