"use client";

import { useEffect, useState } from "react";
import RecentOrders from "./components/RecentOrders";
import { ManagerOrder } from "../types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManagerDashboard() {
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Manager dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* -------------------------------------------------------
     DATE FILTER LOGIC
  -------------------------------------------------------- */
  const filterByDate = (order: ManagerOrder) => {
    const created = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === "today") {
      return created.toDateString() === now.toDateString();
    }

    if (dateFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return created.toDateString() === yesterday.toDateString();
    }

    if (dateFilter === "7") {
      const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    if (dateFilter === "30") {
      const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }

    return true; // "all"
  };

  const filteredOrders = orders.filter(filterByDate);

  /* -------------------------------------------------------
     KPI CALCULATIONS
  -------------------------------------------------------- */
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const cashSales = filteredOrders
    .filter((o) => o.paymentType === "cash")
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = filteredOrders
    .filter((o) => o.paymentType === "card")
    .reduce((sum, o) => sum + o.total, 0);

  /* -------------------------------------------------------
     SALES BY FULFILLMENT TYPE
  -------------------------------------------------------- */
  const posSales = filteredOrders
    .filter((o) => o.fulfillmentType === "POS")
    .reduce((sum, o) => sum + o.total, 0);

  const pickupSales = filteredOrders
    .filter((o) => o.fulfillmentType === "pickup")
    .reduce((sum, o) => sum + o.total, 0);

  const shippingSales = filteredOrders
    .filter((o) => o.fulfillmentType === "shipping")
    .reduce((sum, o) => sum + o.total, 0);

  const deliverySales = filteredOrders
    .filter((o) => o.fulfillmentType === "delivery")
    .reduce((sum, o) => sum + o.total, 0);

  /* -------------------------------------------------------
     ORDER STATUS COUNTS (FINAL LOGIC)
  -------------------------------------------------------- */
  const completedCount = filteredOrders.filter(
    (o) => o.status === "completed" || o.status === "PickedUp"
  ).length;

  const filledCount = filteredOrders.filter(
    (o) => o.status === "Ready"
  ).length;

  const unfulfilledCount = filteredOrders.filter(
    (o) => o.status === "pending" || o.status === "paid"
  ).length;

  /* -------------------------------------------------------
     FULFILLMENT COUNTS
  -------------------------------------------------------- */
  const pickupCount = filteredOrders.filter((o) => o.fulfillmentType === "pickup").length;
  const posCount = filteredOrders.filter((o) => o.fulfillmentType === "POS").length;
  const shippingCount = filteredOrders.filter((o) => o.fulfillmentType === "shipping").length;
  const deliveryCount = filteredOrders.filter((o) => o.fulfillmentType === "delivery").length;

  return (
    <div className="min-h-screen px-8 py-6 bg-gradient-to-b from-violet-200/40 to-violet-100/40">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">
          Manager Dashboard
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-violet-600 mt-2 font-bold">
          Business Overview • Analytics • Admin Tools
        </p>
      </div>

      {/* DATE FILTER */}
      <div className="flex gap-3 mb-8">
        {[
          { label: "Today", value: "today" },
          { label: "Yesterday", value: "yesterday" },
          { label: "Last 7 Days", value: "7" },
          { label: "Last 30 Days", value: "30" },
          { label: "All", value: "all" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide border ${
              dateFilter === f.value
                ? "bg-violet-600 text-white border-violet-700"
                : "bg-white text-violet-700 border-violet-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-white rounded-3xl shadow border border-green-200">
          <h3 className="text-sm font-bold uppercase text-green-700 tracking-widest">
            Total Sales
          </h3>
          <p className="text-4xl font-black text-green-700 mt-2">
            ${totalSales.toFixed(2)}
          </p>

          {/* SALES BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 mt-5">

            <div className="p-6 bg-white rounded-3xl shadow border border-green-200">
              <h3 className="text-sm font-bold uppercase text-green-600 tracking-widest">
                Cash Sales
              </h3>
              <p className="text-3xl font-black text-green-600 mt-2">
                ${cashSales.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-emerald-200">
              <h3 className="text-sm font-bold uppercase text-emerald-800 tracking-widest">
                Card Sales
              </h3>
              <p className="text-3xl font-black text-emerald-800 mt-2">
                ${cardSales.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-pink-200">
              <h3 className="text-sm font-bold uppercase text-pink-600 tracking-widest">
                POS Sales
              </h3>
              <p className="text-3xl font-black text-pink-600 mt-2">
                ${posSales.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-purple-200">
              <h3 className="text-sm font-bold uppercase text-purple-700 tracking-widest">
                Pickup Sales
              </h3>
              <p className="text-3xl font-black text-purple-800 mt-2">
                ${pickupSales.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-blue-200">
              <h3 className="text-sm font-bold uppercase text-blue-700 tracking-widest">
                Shipping Sales
              </h3>
              <p className="text-3xl font-black text-blue-800 mt-2">
                ${shippingSales.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-orange-200">
              <h3 className="text-sm font-bold uppercase text-orange-700 tracking-widest">
                Delivery Sales
              </h3>
              <p className="text-3xl font-black text-orange-800 mt-2">
                ${deliverySales.toFixed(2)}
              </p>
            </div>

          </div>
        </div>

        {/* ORDER COUNTS */}
        <div className="p-6 bg-white rounded-3xl shadow border border-blue-200">
          <h3 className="text-sm font-bold uppercase text-blue-900 tracking-widest">
            Total Orders
          </h3>
          <p className="text-4xl font-black text-blue-900 mt-2">{totalOrders}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-5">
            <div className="p-6 bg-white rounded-3xl shadow border border-teal-200">
              <h3 className="text-sm font-bold uppercase text-teal-600 tracking-widest">
                Completed Orders
              </h3>
              <p className="text-3xl font-black text-teal-600 mt-2">
                {completedCount}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-blue-200">
              <h3 className="text-sm font-bold uppercase text-blue-600 tracking-widest">
                Filled Orders
              </h3>
              <p className="text-3xl font-black text-blue-600 mt-2">
                {filledCount}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-red-200">
              <h3 className="text-sm font-bold uppercase text-red-600 tracking-widest">
                Unfulfilled Orders
              </h3>
              <p className="text-3xl font-black text-red-600 mt-2">
                {unfulfilledCount}
              </p>
            </div>
          </div>

          {/* FULFILLMENT BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 mt-5">
            <div className="p-6 bg-white rounded-3xl shadow border border-pink-200">
              <h3 className="text-sm font-bold uppercase text-pink-600 tracking-widest">
                POS Orders
              </h3>
              <p className="text-3xl font-black text-pink-600 mt-2">{posCount}</p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-purple-200">
              <h3 className="text-sm font-bold uppercase text-purple-700 tracking-widest">
                Pickup Orders
              </h3>
              <p className="text-3xl font-black text-purple-800 mt-2">{pickupCount}</p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-blue-200">
              <h3 className="text-sm font-bold uppercase text-blue-700 tracking-widest">
                Shipping Orders
              </h3>
              <p className="text-3xl font-black text-blue-800 mt-2">{shippingCount}</p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow border border-orange-200">
              <h3 className="text-sm font-bold uppercase text-orange-700 tracking-widest">
                Delivery Orders
              </h3>
              <p className="text-3xl font-black text-orange-800 mt-2">{deliveryCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AVG ORDER VALUE */}
      <div className="p-6 bg-white rounded-3xl shadow border border-sky-200 mb-10">
        <h3 className="text-sm font-bold uppercase text-sky-800 tracking-widest">
          Avg Order Value
        </h3>
        <p className="text-4xl font-black text-sky-900 mt-2">
          ${avgOrderValue.toFixed(2)}
        </p>
      </div>

      {/* RECENT ORDERS */}
      <div className="p-6 bg-white rounded-3xl shadow border border-violet-300 mb-10">
        <RecentOrders />
      </div>
    </div>
  );
}
