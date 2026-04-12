"use client";

import { useEffect, useState } from "react";

export function useManagerDashboard() {
  const [orders, setOrders] = useState([]);

  // Your backend URL (local or Railway depending on environment)
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/orders`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    }

    load();
  }, [API_URL]);

  // -------------------------------------------------------
  // 🗓️ Filter today's orders
  // -------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o: any) => {
    const ts = new Date(o.timestamp);
    return ts >= today;
  });

  // -------------------------------------------------------
  // 📊 Metrics
  // -------------------------------------------------------
  const totalSales = todayOrders.reduce(
    (sum: number, o: any) => sum + o.total,
    0
  );

  const totalOrders = todayOrders.length;

  const avgOrderValue =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  // -------------------------------------------------------
  // 💳 Payment breakdown
  // -------------------------------------------------------
  const cashSales = todayOrders
    .filter((o: any) => o.paymentType === "cash")
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const cardSales = todayOrders
    .filter((o: any) => o.paymentType === "card")
    .reduce((sum: number, o: any) => sum + o.total, 0);

  return {
    todayOrders,
    totalSales,
    totalOrders,
    avgOrderValue,
    cashSales,
    cardSales,
  };
}
