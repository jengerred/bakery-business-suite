"use client";

import { useEffect, useRef, useState } from "react";
import { ManagerOrder } from "../../types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useOrders() {
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const previousRef = useRef<string>("");

  /* -------------------------------------------------------
  FETCH + LIVE REFRESH
  -------------------------------------------------------- */
  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();

      const newJson = JSON.stringify(data);
      if (newJson !== previousRef.current) {
        setOrders(data);
        previousRef.current = newJson;
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
  DATE FILTERS
  -------------------------------------------------------- */
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  const filterByDate = (range: string) => {
    return orders.filter((o) => {
      const created = new Date(o.createdAt);

      if (range === "today") return created >= todayStart;
      if (range === "yesterday")
        return (
          created >= yesterdayStart &&
          created < todayStart
        );
      if (range === "7")
        return (now.getTime() - created.getTime()) / 86400000 <= 7;
      if (range === "30")
        return (now.getTime() - created.getTime()) / 86400000 <= 30;

      return true; // "all"
    });
  };

  /* -------------------------------------------------------
  SORTING
  -------------------------------------------------------- */
  const sortedNewest = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  /* -------------------------------------------------------
  FULFILLMENT GROUPS
  -------------------------------------------------------- */
  const pickup = {
    all: orders.filter((o) => o.fulfillmentType === "pickup"),
    needs: orders.filter(
      (o) =>
        o.fulfillmentType === "pickup" &&
        !["ready", "pickedup", "completed"].includes(o.status.toLowerCase())
    ),
    ready: orders.filter(
      (o) =>
        o.fulfillmentType === "pickup" &&
        o.status.toLowerCase() === "ready"
    ),
    completed: orders.filter(
      (o) =>
        o.fulfillmentType === "pickup" &&
        ["pickedup", "completed"].includes(o.status)
    ),
  };

  const shipping = {
    all: orders.filter((o) => o.fulfillmentType === "shipping"),
    needs: orders.filter(
      (o) =>
        o.fulfillmentType === "shipping" &&
        !o.trackingNumber &&
        !o.fulfilledAt &&
        o.status.toLowerCase() !== "ready"
    ),
    readyToPack: orders.filter(
      (o) =>
        o.fulfillmentType === "shipping" &&
        o.status.toLowerCase() === "ready"
    ),
    readyToShip: orders.filter(
      (o) =>
        o.fulfillmentType === "shipping" &&
        o.trackingNumber &&
        !o.fulfilledAt
    ),
    shipped: orders.filter(
      (o) =>
        o.fulfillmentType === "shipping" &&
        o.fulfilledAt
    ),
  };

  const delivery = {
    all: orders.filter((o) => o.fulfillmentType === "delivery"),
    needs: orders.filter(
      (o) =>
        o.fulfillmentType === "delivery" &&
        ["pending", "paid"].includes(o.status.toLowerCase())
    ),
    ready: orders.filter(
      (o) =>
        o.fulfillmentType === "delivery" &&
        o.status.toLowerCase() === "ready"
    ),
    outForDelivery: orders.filter(
      (o) =>
        o.fulfillmentType === "delivery" &&
        ["outfordelivery", "intransit"].includes(o.status)
    ),
    delivered: orders.filter(
      (o) =>
        o.fulfillmentType === "delivery" &&
        ["delivered", "completed"].includes(o.status)
    ),
  };

  const pos = {
    all: orders.filter((o) => o.fulfillmentType === "POS"),
  };

  /* -------------------------------------------------------
  STATUS GROUPS
  -------------------------------------------------------- */
  const statusGroups = {
    completed: orders.filter(
      (o) =>
        ["completed", "pickedup", "delivered"].includes(
          o.status.toLowerCase()
        )
    ),
    filled: orders.filter((o) => o.status.toLowerCase() === "ready"),
    unfulfilled: orders.filter((o) =>
      ["pending", "paid"].includes(o.status.toLowerCase())
    ),
  };

  /* -------------------------------------------------------
  KPI CALCULATIONS
  -------------------------------------------------------- */
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const cashSales = orders
    .filter((o) => o.paymentType === "cash")
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = orders
    .filter((o) => o.paymentType === "card")
    .reduce((sum, o) => sum + o.total, 0);

  const fulfillmentSales = {
    pos: pos.all.reduce((s, o) => s + o.total, 0),
    pickup: pickup.all.reduce((s, o) => s + o.total, 0),
    shipping: shipping.all.reduce((s, o) => s + o.total, 0),
    delivery: delivery.all.reduce((s, o) => s + o.total, 0),
  };

  /* -------------------------------------------------------
  RETURN EVERYTHING
  -------------------------------------------------------- */
  return {
    loading,
    orders,
    refresh: loadOrders,

    sorted: {
      newest: sortedNewest,
    },

    byDate: {
      filterByDate,
    },

    byFulfillment: {
      pickup,
      shipping,
      delivery,
      pos,
    },

    byStatus: statusGroups,

    kpis: {
      totalSales,
      totalOrders,
      avgOrderValue,
      cashSales,
      cardSales,
      ...fulfillmentSales,
    },
  };
}
