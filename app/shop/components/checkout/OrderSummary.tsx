"use client";

interface OrderSummaryProps {
  cart: any[];
  method: "pickup" | "shipping" | null;
  subtotal: number;
  finalTotal: number;
  onSwitchToToggle?: () => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
}

export default function OrderSummary({ 
  cart, 
  method, 
  subtotal, 
  finalTotal, 
  onSwitchToToggle,
  onIncrement,
  onDecrement
}: OrderSummaryProps) {
  return (
    <section className="pt-4 border-t border-stone-100">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-4">
        Order Summary
      </h3>
      
      <div className="space-y-4 mb-6">
      {cart.map((item: any, idx: number) => (
  <div key={idx} className="flex justify-between items-center py-2">
    {/* ITEM NAME (Left) */}
    <span className="font-bold text-stone-600 text-sm truncate max-w-[140px]">
      {item.product.name}
    </span>

    {/* CONTROLS & PRICE (Right Side Group) */}
    <div className="flex items-center gap-4">
      {/* THE PILL - Now in the middle */}
      <div className="flex items-center bg-stone-100 rounded-full p-0.5 border border-stone-200">
        <button 
          onClick={() => onDecrement(item.product.id)}
          className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-stone-600 hover:text-violet-600 shadow-sm transition-all active:scale-90 font-bold"
        >
          −
        </button>
        <span className="px-2 text-[11px] font-black text-stone-900 min-w-[20px] text-center">
          {item.quantity}
        </span>
        <button 
          onClick={() => onIncrement(item.product.id)}
          className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-stone-600 hover:text-violet-600 shadow-sm transition-all active:scale-90 font-bold"
        >
          +
        </button>
      </div>

      {/* PRICE (Far Right) */}
      <span className="font-bold text-stone-900 text-sm min-w-[55px] text-right">
        ${(item.product.price * item.quantity).toFixed(2)}
      </span>
    </div>
  </div>
))}
        
        {/* Method Toggle Row */}
        <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-stone-200">
          <div className="flex flex-col">
            <span className={`${method === 'shipping' ? 'text-violet-600' : 'text-stone-500'} font-bold`}>
              {method === 'shipping' ? 'Flat Rate Shipping' : 'Local Pickup'}
            </span>
            {onSwitchToToggle && (
              <button 
                onClick={onSwitchToToggle} 
                className="text-[11px] text-violet-400 uppercase tracking-tight text-left underline decoration-violet-200 hover:text-violet-800 transition-all"
              >
                {method === 'shipping' ? '⇆ Switch to Free Pickup?' : '⇆ Switch to Shipping?'}
              </button>
            )}
          </div>
          <span className={`${method === 'shipping' ? 'text-violet-600' : 'text-stone-900'} font-bold`}>
            {method === 'shipping' ? '$12.00' : 'FREE'}
          </span>
        </div>
      </div>

      {/* Grand Total Box */}
      <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">
            Total Due
          </span>
          <span className="text-3xl font-bold text-stone-900 tracking-tighter">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
}