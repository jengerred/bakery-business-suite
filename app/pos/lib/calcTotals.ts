/* -------------------------------------------------------
   🧺 Product Type
   Used to type each item in the order.
------------------------------------------------------- */
import { Product } from "./products";

/* -------------------------------------------------------
   🧮 calculateTotals
   Computes subtotal, tax, and total for the current order.
   - subtotal: sum of (price × quantity)
   - tax: 6% Michigan sales tax
   - total: subtotal + tax
------------------------------------------------------- */
export function calculateTotals(
  order: { product: Product; quantity: number }[]
) {
  /* ------------------------------
     💵 Subtotal
     Sum of all line items before tax.
  ------------------------------ */
  const subtotal = order.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /* ------------------------------
     🧾 Tax (6% Michigan)
  ------------------------------ */
  const tax = subtotal * 0.06;

  /* ------------------------------
     💰 Final Total
  ------------------------------ */
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
