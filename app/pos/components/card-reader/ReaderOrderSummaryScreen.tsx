"use client";

/* -------------------------------------------------------
   🧺 Types
   Product type is used to type each cart item.
------------------------------------------------------- */
import type { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   🧱 Local Types
   CartItem: a product + quantity pair
   Props: order items + calculated totals
------------------------------------------------------- */
type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  order: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  customerName: string | null;
};

/* -------------------------------------------------------
   🧾 ReaderOrderSummaryScreen
   Customer-facing order summary shown on the reader.

   Responsibilities:
   - Display customer name (if available)
   - List all items in the order
   - Show subtotal, tax, and total
   - Keep layout compact for small reader screens

   NOTE:
   - This component is intentionally simple and presentational.
   - No state, no effects, no business logic.
------------------------------------------------------- */
export default function ReaderOrderSummaryScreen({
  order,
  totals,
  customerName,
}: Props) {
  return (
    <div className="space-y-4 text-gray-700">

      {/* ---------------------------------------------------
         🏷️ Header
      --------------------------------------------------- */}
      <h2 className="text-xl font-semibold text-center">Order Summary</h2>

      {/* ---------------------------------------------------
         👤 Customer Name (optional)
      --------------------------------------------------- */}
      {customerName && (
        <p className="text-sm text-gray-700 mb-2">
          <strong>Customer:</strong> {customerName}
        </p>
      )}

      {/* ---------------------------------------------------
         🛒 Item List
         Scrollable to handle large orders
      --------------------------------------------------- */}
      <div className="space-y-2 max-h-48 overflow-auto pr-1">
        {order.map((item) => (
          <div
            key={item.product.id}
            className="flex justify-between text-sm"
          >
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------
         🧮 Totals
      --------------------------------------------------- */}
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
