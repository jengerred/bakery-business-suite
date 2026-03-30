"use client";

/* -------------------------------------------------------
   🧠 Order History Context
   Provides access to:
   - orderHistory (array of CompletedOrder)
   - clearHistory() to wipe all records

   NOTE:
   - This component is cashier-facing.
   - It displays all completed orders stored in localStorage.
------------------------------------------------------- */
import { useOrderHistoryContext } from "../context/OrderHistoryContext";

/* -------------------------------------------------------
   📜 OrderHistory
   Cashier-facing list of all completed orders.

   Responsibilities:
   - Show each order with:
       • Shortened Order ID
       • Timestamp
       • Line items
       • Total
   - Provide a "Clear History" button when orders exist

   NOTE:
   - This is intentionally simple and presentational.
   - No business logic lives here — all state comes from context.
------------------------------------------------------- */
export default function OrderHistory() {
  const { orderHistory, clearHistory } = useOrderHistoryContext();

  return (
    <div className="p-6 space-y-6 bg-white border rounded-lg shadow-sm min-h-[600px]">
      <h2 className="text-xl font-semibold mb-4">Order History</h2>

      {/* -------------------------------------------------------
         🪹 EMPTY STATE
         Shown when no orders have been completed yet.
      ------------------------------------------------------- */}
      {orderHistory.length === 0 && (
        <p className="text-gray-500">No orders yet.</p>
      )}

      {/* -------------------------------------------------------
         📦 ORDER LIST
         Displays each completed order with items + totals.
      ------------------------------------------------------- */}
      <ul className="space-y-4">
        {orderHistory.map((order) => (
          <li key={order.id} className="border p-3 rounded">

            {/* Order ID + timestamp */}
            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.timestamp).toLocaleString()}
            </p>

            {/* Line items */}
            <ul className="mt-2 text-sm">
              {order.items.map((item) => (
                <li key={item.product.id}>
                  {item.quantity}× {item.product.name}
                </li>
              ))}
            </ul>

            {/* Total */}
            <p className="font-semibold mt-2">
              Total: ${order.total.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      {/* -------------------------------------------------------
         🗑️ CLEAR HISTORY BUTTON
         Only shown when at least one order exists.
      ------------------------------------------------------- */}
      {orderHistory.length > 0 && (
        <button
          onClick={clearHistory}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear History
        </button>
      )}
    </div>
  );
}
