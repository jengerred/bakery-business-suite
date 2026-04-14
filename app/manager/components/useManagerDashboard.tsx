"use client";

import { useEffect, useState } from "react";
import type { ManagerOrder } from "./types";

export function useManagerDashboard() {
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
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

  // Normalize "today"
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ⭐ Only use created_at
  const todayOrders = orders.filter((o) => {
    const created = new Date(o.createdAt);
    return created >= today;
  });

  const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const cashSales = todayOrders
    .filter((o) => o.paymentType === "cash")
    .reduce((s, o) => s + o.total, 0);

  const cardSales = todayOrders
    .filter((o) => o.paymentType === "card")
    .reduce((s, o) => s + o.total, 0);

  return {
    todayOrders,
    totalSales,
    totalOrders,
    avgOrderValue,
    cashSales,
    cardSales,
  };
}
