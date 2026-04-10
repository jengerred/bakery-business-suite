"use client";

/* -------------------------------------------------------
   🧺 Product Type
------------------------------------------------------- */
import { Product } from "@/app/types/product";   // Backend Product type

/* -------------------------------------------------------
   🧾 OrderItem Type
   Updated to include overridePrice for bulk/dozen deals.
------------------------------------------------------- */
type OrderItem = {
  product: Product;
  quantity: number;
  overridePrice?: number; // The flat rate for a bundle (e.g., $20.00 for 12)
};

/* -------------------------------------------------------
   💵 OrderTotals (Cashier-Side)
   Calculates and renders the financial breakdown of the order.
------------------------------------------------------- */
type OrderTotalsProps = {
  order: OrderItem[]; 
};

export default function OrderTotals({ order }: OrderTotalsProps) {

  /* -------------------------------------------------------
     🧮 Calculate Totals
     Logic: Checks the 'taxable' status of each product to 
     ensure we only apply the 6% Michigan sales tax to 
     eligible items (like drinks or prepared foods).
  ------------------------------------------------------- */
  
  // 1. Calculate the overall Subtotal (Total of all items)
  const subtotal = order.reduce((sum, item) => {
    const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
    return sum + (activePrice * item.quantity);
  }, 0);

  // 2. Calculate the Taxable Portion (Only items where taxable is true)
  const taxableSubtotal = order.reduce((sum, item) => {
    if (item.product.taxable) {
      const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
      return sum + (activePrice * item.quantity);
    }
    return sum;
  }, 0);

  const taxRate = 0.06; // Michigan sales tax
  const tax = taxableSubtotal * taxRate;
  const total = subtotal + tax;

  /* -------------------------------------------------------
     🎨 Render Totals UI
  ------------------------------------------------------- */
  return (
    <section className="p-6 border-2 border-violet-100 rounded-[2rem] bg-white/80 backdrop-blur-md shadow-sm mt-4">
      <h2 className="text-md font-black text-violet-700 uppercase tracking-[0.2em] mb-4">Totals</h2>

      {/* Subtotal - The raw cost of all items */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Subtotal</span>
        <span className="text-lg font-black text-slate-800">${subtotal.toFixed(2)}</span>
      </div>

      {/* Tax (6%) - Calculated only on taxable items */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Tax (6%)</span>
        <span className="text-lg font-black text-slate-800">${tax.toFixed(2)}</span>
      </div>

      {/* Visual Divider */}
      <div className="h-px bg-violet-100 w-full mb-4" />

      {/* Final Total - Subtotal + Calculated Tax */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-black text-violet-900 uppercase tracking-widest">Total Due</span>
        <span className="text-3xl font-black text-violet-600">${total.toFixed(2)}</span>
      </div>
    </section>
  );
}