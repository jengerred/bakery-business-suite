"use client";

/* ---------------------------------------------------------
   Imports
   --------------------------------------------------------- */
import { useState, useEffect } from "react";
import { Product } from "../lib/products";

/* ---------------------------------------------------------
   Props
   --------------------------------------------------------- */
type ProductOptionsModalProps = {
  product: Product;                           // Product being edited
  quantity: number;                           // Initial quantity
  priceOverride?: number;                     // Optional custom price
  existsInCart: boolean;                      // Determines Add vs Update UI
  onClose: () => void;                        // Close modal
  onSave: (product: Product, newQty: number, price?: number) => void;
  onDelete: (product: Product) => void;       // Remove from cart
};

/* ---------------------------------------------------------
   PRODUCT OPTIONS MODAL
   - Allows cashier to adjust quantity
   - Supports manual input + +/- buttons
   - Supports price overrides
   - Supports delete when item already in cart
   --------------------------------------------------------- */
export default function ProductOptionsModal({
  product,
  quantity,
  priceOverride,
  existsInCart,
  onClose,
  onSave,
  onDelete,
}: ProductOptionsModalProps) {

  /* -----------------------------
     Local quantity state
     ----------------------------- */
  const [localQty, setLocalQty] = useState(quantity || 1);

  /* -----------------------------
     Sync quantity when parent updates
     ----------------------------- */
  useEffect(() => {
    setLocalQty(quantity || 1);
  }, [quantity]);

  /* -----------------------------
     Do not render if no product
     ----------------------------- */
  if (!product) return null;

  /* -----------------------------
     Determine final price
     ----------------------------- */
  const finalPrice =
    priceOverride !== undefined ? priceOverride : product.price;

  /* -----------------------------
     Handle manual quantity input
     ----------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLocalQty(isNaN(val) || val < 1 ? 1 : val);
  };

  /* -----------------------------
     UI
     ----------------------------- */
  return (
    <div className="fixed inset-0 bg-violet-900/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">

      {/* -----------------------------------------------------
         MODAL CONTAINER
         ----------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] w-[440px] shadow-2xl border border-white/10 transition-all">

        {/* -----------------------------------------------------
           PRODUCT HEADER
           ----------------------------------------------------- */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight mb-4">
            {product.name}
          </h2>

          <div className="inline-block px-10 py-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl border-2 border-violet-200 dark:border-violet-800">
            <p className="text-violet-600 dark:text-violet-400 font-black text-4xl">
              ${(finalPrice * localQty).toFixed(2)}
            </p>
          </div>
        </div>

        {/* -----------------------------------------------------
           QUANTITY SELECTOR
           ----------------------------------------------------- */}
        <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-[2rem] mb-8 border border-violet-100 dark:border-violet-800">
          <div className="flex items-center justify-between">
            <span className="font-black text-violet-400 uppercase text-xs tracking-widest">
              Quantity
            </span>

            <div className="flex items-center gap-4">

              {/* Decrease */}
              <button
                onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-violet-200 rounded-xl font-black text-2xl text-violet-600 active:scale-90 transition-all shadow-sm"
              >
                –
              </button>

              {/* Manual Input */}
              <input
                type="number"
                value={localQty}
                onChange={handleInputChange}
                className="w-16 bg-transparent text-3xl font-black text-center text-slate-800 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              {/* Increase */}
              <button
                onClick={() => setLocalQty(localQty + 1)}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-violet-200 rounded-xl font-black text-2xl text-violet-600 active:scale-90 transition-all shadow-sm"
              >
                +
              </button>

            </div>
          </div>
        </div>

        {/* -----------------------------------------------------
           ACTION BUTTONS
           ----------------------------------------------------- */}
        <div className="flex flex-col gap-4">

          {/* Save / Add / Update */}
          <button
            onClick={() => {
              onSave(product, localQty, finalPrice);
              onClose();
            }}
            className="w-full py-6 bg-violet-600 hover:bg-violet-700 text-white rounded-[1.5rem] font-black text-2xl shadow-xl shadow-violet-600/40 active:scale-95 transition-all uppercase tracking-widest"
          >
            {existsInCart ? "Update Order" : "Add to Order"}
          </button>

          {/* Cancel + Delete */}
          <div className="flex gap-4 mt-2">

            <button
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 hover:text-slate-600 font-black uppercase text-xs tracking-[0.2em] transition-colors"
            >
              Cancel
            </button>

            {existsInCart && (
              <button
                onClick={() => onDelete(product)}
                className="flex-1 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all"
              >
                Delete
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
