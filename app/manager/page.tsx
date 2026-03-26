"use client";

/* -------------------------------------------------------
   📦 Manager Dashboard Components
   These are small, focused UI blocks that keep the page
   clean and maintainable.
------------------------------------------------------- */
import SummaryCards from "./components/SummaryCards";
import PaymentBreakdown from "./components/PaymentBreakdown";
import RecentOrders from "./components/RecentOrders";

/* -------------------------------------------------------
   🎯 useTodayOrders
   Custom hook that:
   - Filters today's orders
   - Computes sales metrics
   - Computes payment breakdown
   Keeps the page tiny and declarative.
------------------------------------------------------- */
import { useTodayOrders } from "./components/useTodayOrders";

/* -------------------------------------------------------
   📊 ManagerDashboard (clean + tiny)
   This page simply *composes* the dashboard sections.
   All logic lives in the hook and components.
------------------------------------------------------- */
export default function ManagerDashboard() {
  const {
    todayOrders,
    totalSales,
    totalOrders,
    avgOrderValue,
    cashSales,
    cardSales,
  } = useTodayOrders();

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">Manager Dashboard</h1>

      {/* 📊 Summary metrics: total sales, order count, AOV */}
      <SummaryCards
        totalSales={totalSales}
        totalOrders={totalOrders}
        avgOrderValue={avgOrderValue}
      />

      {/* 💳 Cash vs Card breakdown */}
      <PaymentBreakdown cashSales={cashSales} cardSales={cardSales} />

      {/* 🧾 Last 5 orders of the day */}
      <RecentOrders todayOrders={todayOrders} />
    </div>
  );
}
