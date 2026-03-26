"use client";

/* -------------------------------------------------------
   📦 Types
   CompletedOrder contains all order + payment details.
------------------------------------------------------- */
import { CompletedOrder } from "../context/OrderHistoryContext";

/* -------------------------------------------------------
   🧾 ReceiptModal
   Displays a printable receipt for a completed order.
   Includes:
   - Order metadata
   - Line items
   - Totals
   - Payment details (cash, credit, debit)
   - Print + Close actions
------------------------------------------------------- */
type ReceiptModalProps = {
  order: CompletedOrder; // The order being displayed
  onClose: () => void;   // Close modal callback
};

export default function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  /* ------------------------------
     🧮 Recalculate totals
     (Stored totals exist, but recalculating ensures accuracy)
  ------------------------------ */
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  /* ------------------------------
     🎨 Render Receipt UI
  ------------------------------ */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">

        {/* -------------------------------------------------------
           🧾 HEADER
        ------------------------------------------------------- */}
        <h2 className="text-xl font-semibold mb-4">Receipt</h2>

        {/* -------------------------------------------------------
           📅 ORDER INFO
        ------------------------------------------------------- */}
        <p className="text-sm text-gray-500 mb-2">
          Order ID: {order.id.slice(0, 8)}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {new Date(order.timestamp).toLocaleString()}
        </p>

        {/* -------------------------------------------------------
           🛒 LINE ITEMS
        ------------------------------------------------------- */}
        <ul className="space-y-2 mb-4">
          {order.items.map((item) => (
            <li key={item.product.id} className="flex justify-between">
              <span>
                {item.quantity}× {item.product.name}
              </span>
              <span>
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        {/* -------------------------------------------------------
           💵 TOTALS
        ------------------------------------------------------- */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (6%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* -------------------------------------------------------
           💳 PAYMENT DETAILS
        ------------------------------------------------------- */}
        <div className="border-t pt-3 mt-4 text-sm space-y-1">
          <p className="font-semibold mb-1">Payment Details</p>

          {/* ---------------- CASH ---------------- */}
          {order.paymentType === "cash" && (
            <>
              <p>Payment Method: Cash</p>
              <p>Cash Tendered: ${order.cashTendered?.toFixed(2)}</p>
              <p>Change Given: ${order.changeGiven?.toFixed(2)}</p>
            </>
          )}

          {/* ---------------- CREDIT ---------------- */}
          {order.paymentType === "credit" && (
            <>
              <p>Payment Method: Credit Card</p>
              {order.cardEntryMethod === "manual" && <p>Entry: Manual</p>}
              {order.cardEntryMethod === "terminal" && (
                <p>Entry: Chip/Tap/Swipe</p>
              )}
              {order.stripePaymentId && (
                <p className="text-xs text-gray-500">
                  Payment ID: {order.stripePaymentId}
                </p>
              )}
            </>
          )}

          {/* ---------------- DEBIT ---------------- */}
          {order.paymentType === "debit" && (
            <>
              <p>Payment Method: Debit Card</p>
              {order.cardEntryMethod === "manual" && <p>Entry: Manual</p>}
              {order.cardEntryMethod === "terminal" && (
                <p>Entry: Chip/Tap/Swipe</p>
              )}
              {order.stripePaymentId && (
                <p className="text-xs text-gray-500">
                  Payment ID: {order.stripePaymentId}
                </p>
              )}
            </>
          )}
        </div>

        {/* -------------------------------------------------------
           🖨️ ACTION BUTTONS
        ------------------------------------------------------- */}
        <div className="receipt-actions">
          <div className="flex justify-end mt-6">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 mr-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Print Receipt
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
