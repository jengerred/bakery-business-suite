"use client";

/* -------------------------------------------------------
   🧾 Types
------------------------------------------------------- */
import { CompletedOrder } from "../context/OrderHistoryContext";

type ReceiptModalProps = {
  order: CompletedOrder;
  // Added undefined as a possible state for "waiting for selection"
  receiptMethod: "print" | "email" | "text" | "none" | null | undefined;
  onClose: () => void;
};

export default function ReceiptModal({ order, receiptMethod, onClose }: ReceiptModalProps) {
  
  /* -------------------------------------------------------
     🧮 Financial Logic (Michigan Tax Exempt)
  ------------------------------------------------------- */
  // Use order values if present, otherwise calculate from items
  const subtotal = order.subtotal || order.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const tax = order.tax !== undefined ? order.tax : 0;
  const total = order.total || (subtotal + tax);

  /* -------------------------------------------------------
     ✅ Logic: Enable Print/Close even if no user choice made (Cash fallback)
  ------------------------------------------------------- */
  // Print is enabled if selected, if it's a cash checkout (null), or if explicitly set to none
  const printEnabled = receiptMethod === "print" || receiptMethod === "none" || receiptMethod === null;

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-slate-900">
      
      {/* ⚙️ GUI BANNER (Top) - Hidden on physical print */}
      <div className="p-6 print:hidden">
        {receiptMethod && (
          <div className="p-4 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/20 text-center animate-in fade-in slide-in-from-top-2">
            <p className="text-[11px] font-black text-violet-100 uppercase tracking-[0.25em]">
               {receiptMethod === "print" && "🖨️ Customer chose: Print Receipt"}
               {receiptMethod === "email" && "📧 Receipt sent to Email"}
               {receiptMethod === "text" && "📱 Receipt sent to Text"}
               {receiptMethod === "none" && "✅ Transaction Finalized"}
            </p>
          </div>
        )}
      </div>

      {/* 🧾 THE AUTHENTIC PAPER RECEIPT */}
      <div id="receipt-print-area" className="bg-white px-8 pb-8 text-black">
        
        {/* Bakery Header */}
        <div className="text-center mb-6 pt-2">
          <h1 className="text-sm font-bold leading-tight">Veronica Bowens</h1>
          <h2 className="text-xl font-black uppercase leading-tight">MOTHERS SECRET RECIPE</h2>
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Bakery</p>
        </div>

        <div className="border-t border-black mb-4" />

        {order.customerName && (
          <p className="text-sm mb-4">
            <span className="font-bold uppercase text-[10px]">Customer:</span> {order.customerName}
          </p>
        )}

        <div className="text-[10px] mb-6 space-y-1">
          {/* FIXED: Defensive ID slicing */}
          <p>ID: {order?.id ? order.id.slice(0, 8).toUpperCase() : "POS-ORDER"}</p>
          <p>{order.timestamp ? new Date(order.timestamp).toLocaleString() : new Date().toLocaleString()}</p>
        </div>

        {/* Items Table */}
        <ul className="space-y-3 mb-6">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between text-sm items-start">
              <span className="max-w-[75%] leading-tight">
                {item.quantity}× {item.product.name}
                {!item.product.taxable && (
                  <span className="text-[9px] ml-1 font-bold opacity-70">(E)</span>
                )}
              </span>
              <span className="font-bold tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        {/* Financial Summary */}
        <div className="border-t border-black pt-4 space-y-1 text-sm mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (6%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-xl mt-2 border-t border-black pt-2">
            <span>TOTAL</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="text-[10px] space-y-1 uppercase">
          <p className="font-bold mb-1 border-b border-gray-100 pb-1">Payment Info</p>
          <p>Method: {order.paymentType}</p>
          {order.paymentType === "cash" ? (
            <>
              <p>Tendered: ${order.cashTendered?.toFixed(2) || "0.00"}</p>
              <p>Change: ${order.changeGiven?.toFixed(2) || "0.00"}</p>
            </>
          ) : (
            <p>Entry: {order.cardEntryMethod === "terminal" ? "Chip/Tap/Swipe" : "Manual"}</p>
          )}

          {/* Centered Thank You Section */}
          <div className="text-center pt-10 m-0">
            <p className="text-lg font-bold tracking-widest uppercase m-0 leading-none">
              THANK YOU 😊
            </p>
            <div className="text-[10px] leading-tight uppercase tracking-tight mt-1">
              We appreciate your business <br/>
              Have a wonderful day
            </div>
          </div>

          {/* Footer Readability */}
          <div className="text-[9px] mt-8 opacity-80 text-center uppercase font-bold italic border-t border-gray-100 pt-2">
            (E) = Michigan Tax Exempt Food Item
          </div>
        </div>
      </div>

      {/* ⚙️ GUI CONTROLS (Bottom) - Hidden on physical print */}
      <div className="mt-auto p-6 space-y-3 print:hidden bg-violet-50/30 border-t border-violet-100">
        <button
          onClick={() => window.print()}
          disabled={!printEnabled}
          className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all active:scale-95 disabled:opacity-30 shadow-lg"
        >
          Print Receipt
        </button>

        <button
          onClick={onClose}
          className="w-full py-5 bg-violet-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-violet-700 shadow-xl shadow-violet-600/30 transition-all active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}