"use client";

/* -------------------------------------------------------
   📦 Product Type
------------------------------------------------------- */
import { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   👤 Customer Context
------------------------------------------------------- */
import { useCustomer } from "@/app/pos/context/CustomerContext";

/* -------------------------------------------------------
   🧾 OrderSummary (Cashier-Side)
------------------------------------------------------- */
type OrderSummaryProps = {
  order: { product: Product; quantity: number; overridePrice?: number }[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onUpdateQty: (productId: number, newQty: number) => void;
};

export default function OrderSummary({
  order,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateQty,
}: OrderSummaryProps) {
  const { customer } = useCustomer();

  const handleInputChange = (productId: number, value: string) => {
    const val = parseInt(value);
    if (isNaN(val) || val < 1) {
      onUpdateQty(productId, 1);
    } else {
      onUpdateQty(productId, val);
    }
  };

  return (
    <div className="flex flex-col">

      {/* 👤 ACTIVE CUSTOMER BADGE */}
      {customer?.name && (
        <div className="mb-4 p-3 bg-violet-600 rounded-2xl shadow-sm border border-violet-400">
          <p className="text-[10px] font-black text-violet-200 uppercase tracking-widest mb-1">
            Active Customer
          </p>
          <p className="text-white font-black text-lg uppercase tracking-tight">
            {customer.name}
          </p>
        </div>
      )}

      {/* 🪹 EMPTY STATE */}
      {order.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 bg-white/90 border-2 border-dashed border-violet-300 rounded-[2.5rem] opacity-60">
          <span className="text-3xl mb-2">🛒</span>
          <p className="text-violet-900 font-black uppercase tracking-widest text-[9px]">
            No items added yet.
          </p>
        </div>
      )}

      {/* 🛒 ORDER ITEMS LIST */}
      <ul className="space-y-3">
        {order.map((item) => {
          const unitPrice = item.overridePrice ?? item.product.price;
          const lineTotal = unitPrice * item.quantity;

          return (
            <li
              key={item.product.id}
              className="
                flex justify-between items-center flex-wrap
                gap-3 p-4
                bg-white/60 backdrop-blur-sm
                rounded-[1.5rem] border-2 border-transparent
                hover:border-violet-300 transition-all shadow-sm

                max-[585px]:flex-col max-[585px]:items-start
              "
            >
              {/* NAME + PRICE */}
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-black text-slate-900 uppercase tracking-tighter text-sm leading-tight truncate">
                  {item.product.name}
                </p>
                <p className="text-violet-600 font-black text-lg">
                  ${lineTotal.toFixed(2)}
                </p>
              </div>

              {/* QTY + DELETE */}
              <div
                className="
                  flex items-center gap-0.5
                  max-[585px]:w-full max-[585px]:justify-start
                "
              >
                <div className="flex items-center bg-violet-100 rounded-xl p-1 border border-violet-200">
                  <button
                    onClick={() => onDecrease(item.product.id)}
                    className="w-9 h-9 flex items-center justify-center bg-white text-violet-600 rounded-lg font-black text-xl hover:bg-violet-600 hover:text-white transition-all active:scale-90 shadow-sm"
                  >
                    –
                  </button>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleInputChange(item.product.id, e.target.value)
                    }
                    className="
                      w-10 bg-transparent text-center font-black text-slate-800 text-lg
                      focus:outline-none
                      [appearance:textfield]
                      [&::-webkit-outer-spin-button]:appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />

                  <button
                    onClick={() => onIncrease(item.product.id)}
                    className="w-9 h-9 flex items-center justify-center bg-white text-violet-600 rounded-lg font-black text-xl hover:bg-violet-600 hover:text-white transition-all active:scale-90 shadow-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemove(item.product.id)}
                  className="
                    w-9 h-9 flex items-center justify-center
                    text-red-400 hover:text-red-600 hover:bg-red-50
                    rounded-xl transition-all active:scale-75
                  "
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
