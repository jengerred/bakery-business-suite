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

export default function RecentOrders({ todayOrders }: { todayOrders: CompletedOrder[] }) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-3">Order Verification Log</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Time</th>
              <th className="p-2">Type</th>
              <th className="p-2">Location/City</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {todayOrders.slice(-10).reverse().map((order) => (
              <tr key={order.id}>
                <td className="p-2">{new Date(order.timestamp).toLocaleTimeString()}</td>
                <td className="p-2"><span className="px-2 py-1 bg-blue-100 rounded text-xs">{order.fulfillmentType}</span></td>
                <td className="p-2 text-gray-500">{order.city || "In-Store"}</td>
                <td className="p-2 font-mono text-xs">{order.status}</td>
                <td className="p-2 text-right font-bold">${order.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
