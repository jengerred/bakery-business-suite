/* -------------------------------------------------------
   🧺 Product Type
------------------------------------------------------- */
import { Product } from "@/app/types/product";   // Backend Product type

/* -------------------------------------------------------
   🧮 calculateTotals
   Computes subtotal, tax, and total for the current order.

   TAX LOGIC (Grand Rapids, MI):
   - Subtotal: Sum of (price × quantity) for all items.
   - Tax: 6% applied ONLY to items marked 'taxable: true'.
   - Total: Subtotal + calculated tax.

   NOTE:
   - Bakery items (cookies/brownies) are 0% tax in MI.
   - Prepared beverages are 6% tax in MI.
------------------------------------------------------- */
export function calculateTotals(
  order: { product: Product; quantity: number; overridePrice?: number }[]
) {
  /* -------------------------------------------------------
     💵 Subtotal
     Calculates the raw total of all items in the cart.
  ------------------------------------------------------- */
  const subtotal = order.reduce((sum, item) => {
    // Use overridePrice if present (from the Dozen buttons), else use base price
    const unitPrice = item.overridePrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  /* -------------------------------------------------------
     🧾 Tax (Selective 6% Michigan Sales Tax)
     Only calculates tax for items where taxable is true.
  ------------------------------------------------------- */
  const taxableAmount = order.reduce((sum, item) => {
    if (item.product.taxable) {
      const unitPrice = item.overridePrice ?? item.product.price;
      return sum + unitPrice * item.quantity;
    }
    return sum;
  }, 0);

  const tax = taxableAmount * 0.06;

  /* -------------------------------------------------------
     💰 Final Total
  ------------------------------------------------------- */
  const total = subtotal + tax;

  return { 
    subtotal, 
    tax, 
    total 
  };
}