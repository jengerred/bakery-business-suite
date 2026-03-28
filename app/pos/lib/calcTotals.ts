/* -------------------------------------------------------
   🧺 Product Type
   Used to type each item in the order.
------------------------------------------------------- */
import { Product } from "./products";

/* -------------------------------------------------------
   🧮 calculateTotals
   Computes subtotal, tax, and total for the current order.

   Responsibilities:
   - subtotal: sum(price × quantity)
   - tax: 6% Michigan sales tax
   - total: subtotal + tax

   NOTE:
   - Pure function (no side effects)
   - Used by cashier checkout + receipt generation
   - Keeps business logic out of UI components
------------------------------------------------------- */
export function calculateTotals(
  order: { product: Product; quantity: number }[]
) {
  /* -------------------------------------------------------
     💵 Subtotal
     Sum of all line items before tax.
  ------------------------------------------------------- */
  const subtotal = order.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /* -------------------------------------------------------
     🧾 Tax (6% Michigan)
  ------------------------------------------------------- */
  const tax = subtotal * 0.06;

  /* -------------------------------------------------------
     💰 Final Total
  ------------------------------------------------------- */
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
