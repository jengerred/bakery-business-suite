"use client";

/* -------------------------------------------------------
   🧾 Types
   CompletedOrder includes:
   - items
   - totals
   - payment details
   - customer info
------------------------------------------------------- */
import { CompletedOrder } from "../context/OrderHistoryContext";

/* -------------------------------------------------------
   🧱 ReceiptModal (Cashier-Side)
   Displays the final receipt after checkout.

   Responsibilities:
   - Show order items, totals, and payment details
   - Show customer name (if available)
   - Show cashier-only banner indicating receipt choice
   - Allow printing (only when permitted)
   - Allow cashier to close the modal

   NOTE:
   - This is the CASHIER receipt view.
   - The reader has its own receipt-choice UI.
   - The print button is hidden during printing (print:hidden).
------------------------------------------------------- */
type ReceiptModalProps = {
  order: CompletedOrder;
  receiptMethod: "print" | "email" | "text" | "none" | null;
  onClose: () => void;
};

export default function ReceiptModal({
  order,
  receiptMethod,
  onClose,
}: ReceiptModalProps) {

  /* -------------------------------------------------------
     🧮 Totals
  ------------------------------------------------------- */
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  /* -------------------------------------------------------
     🖨️ Print Button Logic
     Enabled only when:
     - Customer chose print
     - OR no account / timeout (receiptMethod === null)
  ------------------------------------------------------- */
  const printEnabled =
    receiptMethod === "print" || receiptMethod === null;

  return (
    <div id="receipt-print-area" className="h-full w-full">
      <div className="bg-white p-4">

        {/* -------------------------------------------------------
           🧾 CASHIER-ONLY RECEIPT METHOD BANNER
           Hidden during printing.
        ------------------------------------------------------- */}
        {receiptMethod && (
          <div className="mb-4 p-2 bg-gray-100 border rounded text-sm text-gray-700 print:hidden">
            {receiptMethod === "print" && "Customer chose: Print Receipt"}
            {receiptMethod === "email" && "Customer chose: Email Receipt"}
            {receiptMethod === "text" && "Customer chose: Text Receipt"}
            {receiptMethod === "none" && "Customer declined a receipt"}
          </div>
        )}

        {/* -------------------------------------------------------
           🧾 RECEIPT HEADER
        ------------------------------------------------------- */}
        <h2 className="text-xl font-semibold mb-2">Receipt</h2>

        {order.customerName && (
          <p className="text-sm text-gray-700 mb-4">
            <strong>Customer:</strong> {order.customerName}
          </p>
        )}

        <p className="text-sm text-gray-500">
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
              <span>{item.quantity}× {item.product.name}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
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

          {order.paymentType === "cash" && (
            <>
              <p>Payment Method: Cash</p>
              <p>Cash Tendered: ${order.cashTendered?.toFixed(2)}</p>
              <p>Change Given: ${order.changeGiven?.toFixed(2)}</p>
            </>
          )}

          {order.paymentType === "credit" && (
            <>
              <p>Payment Method: Credit Card</p>
              {order.cardEntryMethod === "manual" && <p>Entry: Manual</p>}
              {order.cardEntryMethod === "terminal" && <p>Entry: Chip/Tap/Swipe</p>}
            </>
          )}

          {order.paymentType === "debit" && (
            <>
              <p>Payment Method: Debit Card</p>
              {order.cardEntryMethod === "manual" && <p>Entry: Manual</p>}
              {order.cardEntryMethod === "terminal" && <p>Entry: Chip/Tap/Swipe</p>}
            </>
          )}
        </div>

        {/* -------------------------------------------------------
           🖨️ PRINT + CLOSE BUTTONS
           Hidden during printing.
        ------------------------------------------------------- */}
        <div className="flex justify-end mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            disabled={!printEnabled}
            className={`px-4 py-2 mr-2 rounded text-white ${
              printEnabled
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
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
  );
}
