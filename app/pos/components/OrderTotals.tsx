"use client";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type each item in the order.
------------------------------------------------------- */
import { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   🧾 OrderItem Type
   Local type for clarity inside this component.
------------------------------------------------------- */
type OrderItem = {
  product: Product;
  quantity: number;
};

/* -------------------------------------------------------
   💵 OrderTotals (Cashier-Side)
   Displays subtotal, tax, and total for the current order.

   Responsibilities:
   - Compute totals from the order array
   - Apply Michigan's 6% sales tax
   - Render a clean, compact totals block

   NOTE:
   - This is a pure UI component.
   - No state, no effects, no context.
   - The reader has its own totals display.
------------------------------------------------------- */
type OrderTotalsProps = {
  order: OrderItem[]; // Cart items with quantities
};

export default function OrderTotals({ order }: OrderTotalsProps) {

  /* -------------------------------------------------------
     🧮 Calculate Totals
     subtotal = sum(price × qty)
     tax = 6% Michigan sales tax
     total = subtotal + tax
  ------------------------------------------------------- */
  const subtotal = order.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const taxRate = 0.06; // Michigan sales tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  /* -------------------------------------------------------
     🎨 Render Totals UI
  ------------------------------------------------------- */
  return (
    <section className="p-4 border rounded-lg bg-white shadow mt-4">
      <h2 className="text-lg font-semibold mb-3">Totals</h2>

      {/* Subtotal */}
      <div className="flex justify-between text-sm mb-1">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between text-sm mb-1">
        <span>Tax (6%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between font-semibold text-base mt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </section>
  );
}
