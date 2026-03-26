/* -------------------------------------------------------
   🧾 Types
   CompletedOrder comes from global OrderHistory context.
------------------------------------------------------- */
import type { CompletedOrder } from "../context/OrderHistoryContext";

/* -------------------------------------------------------
   🧮 Helpers
   calculateTotals computes subtotal, tax, and total.
------------------------------------------------------- */
import { calculateTotals } from "./calcTotals";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type each item in the order.
------------------------------------------------------- */
import { Product } from "./products";

/* -------------------------------------------------------
   🧱 createCompletedOrder
   Builds a fully‑typed CompletedOrder object from:
   - cart items
   - calculated totals
   - payment details (cash, card, manual, terminal)
------------------------------------------------------- */
export function createCompletedOrder(
  order: { product: Product; quantity: number }[],
  paymentData: any
): CompletedOrder {
  // Calculate subtotal, tax, and total for the order
  const { subtotal, tax, total } = calculateTotals(order);

  // Construct the final CompletedOrder object
  return {
    id: crypto.randomUUID(),          // Unique order ID
    items: order,                     // Cart items
    subtotal,                         // Pre‑tax amount
    tax,                              // Calculated tax
    total,                            // Final total
    paymentType: paymentData.paymentType,           // cash | credit | debit
    cardEntryMethod: paymentData.cardEntryMethod,   // manual | terminal
    cashTendered: paymentData.cashTendered,         // For cash payments
    changeGiven: paymentData.changeGiven,           // For cash payments
    stripePaymentId: paymentData.stripePaymentId,   // For card payments
    timestamp: Date.now(),            // When the order was completed
  };
}
