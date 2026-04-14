"use client";

/* -------------------------------------------------------
   🧠 Shared Order History Context
   Used by POS, Manager, and Shop.
   Now backend-powered.
------------------------------------------------------- */
import { useOrderHistoryContext } from "@/app/pos/context/OrderHistoryContext";
import type { CompletedOrder } from "@/app/pos/context/OrderHistoryContext";

/* -------------------------------------------------------
   🎯 useTodayOrders
   Computes:
   - Today's orders
   - Total sales
   - Order count
   - Average order value
   - Cash vs card breakdown
------------------------------------------------------- */
export function useTodayOrders() {
  const { orderHistory } = useOrderHistoryContext();

  /* -------------------------------------------------------
     📅 Filter orders for *today only*
  ------------------------------------------------------- */
  const today = new Date();
  const todayOrders: CompletedOrder[] = orderHistory.filter((order) => {
  const date = new Date(order.createdAt);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
});


  /* -------------------------------------------------------
     💵 Sales Metrics
  ------------------------------------------------------- */
  const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  /* -------------------------------------------------------
     💳 Payment Breakdown
  ------------------------------------------------------- */
  const cashSales = todayOrders
    .filter((o) => o.paymentType === "cash")
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = todayOrders
    .filter((o) => o.paymentType !== "cash")
    .reduce((sum, o) => sum + o.total, 0);

  /* -------------------------------------------------------
     📦 Return computed values
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
