"use client";

/* -------------------------------------------------------
   🧾 CompletedOrder Type
   Used to type each order displayed in the recent list.
------------------------------------------------------- */
import type { CompletedOrder } from "../../pos/context/OrderHistoryContext";

/* -------------------------------------------------------
   🧾 RecentOrders
   Displays the last 5 orders from today's filtered list.
   Shows:
   - Time of order
   - Total amount
   - Payment type (cash / credit / debit)

   This component is purely presentational.
   All filtering and calculations happen in useTodayOrders().
------------------------------------------------------- */
type Props = {
  todayOrders: CompletedOrder[];
};

export default function RecentOrders({ todayOrders }: Props) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>

      <ul className="space-y-2">
        {todayOrders
          .slice(-5)        // take last 5 orders
          .reverse()        // show newest first
          .map((order) => (
            <li
              key={order.id}
              className="border p-3 rounded flex justify-between"
            >
              {/* Order time */}
              <span>{new Date(order.timestamp).toLocaleTimeString()}</span>

              {/* Order total */}
              <span>${order.total.toFixed(2)}</span>

              {/* Payment type */}
              <span className="capitalize">{order.paymentType}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
