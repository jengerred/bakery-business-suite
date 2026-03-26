"use client";

/* -------------------------------------------------------
   🧠 Order History Context
   Provides access to all completed orders recorded by the POS.
------------------------------------------------------- */
import { useOrderHistoryContext } from "../../pos/context/OrderHistoryContext";
import type { CompletedOrder } from "../../pos/context/OrderHistoryContext";

/* -------------------------------------------------------
   🎯 useTodayOrders
   A small helper hook that:
   - Filters order history to *today only*
   - Computes key sales metrics
   - Computes payment breakdown (cash vs card)
   - Returns everything in a clean, reusable structure

   This keeps the ManagerDashboard page tiny and declarative.
------------------------------------------------------- */
export function useTodayOrders() {
  const { orderHistory } = useOrderHistoryContext();

  /* -------------------------------------------------------
     📅 Filter orders for *today only*
     (Matches day, month, and year)
  ------------------------------------------------------- */
  const today = new Date();
  const todayOrders: CompletedOrder[] = orderHistory.filter((order) => {
    const date = new Date(order.timestamp);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  /* -------------------------------------------------------
     💵 Sales Metrics
     - Total sales
     - Order count
     - Average order value
  ------------------------------------------------------- */
  const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  /* -------------------------------------------------------
     💳 Payment Breakdown
     - Cash sales
     - Card sales (credit + debit)
  ------------------------------------------------------- */
  const cashSales = todayOrders
    .filter((o) => o.paymentType === "cash")
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = todayOrders
    .filter((o) => o.paymentType !== "cash")
    .reduce((sum, o) => sum + o.total, 0);

  /* -------------------------------------------------------
     📦 Return all computed values
     This keeps the dashboard page extremely clean.
  ------------------------------------------------------- */
  return {
    todayOrders,
    totalSales,
    totalOrders,
    avgOrderValue,
    cashSales,
    cardSales,
  };
}
