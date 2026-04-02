"use client";

import { useRouter } from "next/navigation";
import { Product } from "../../pos/lib/products";

type CartItem = { product: Product; quantity: number };

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  cart: CartItem[] 
}) {
  const router = useRouter();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isOpen) return null;

  const handleCheckoutNavigation = () => {
    onClose(); // Close the drawer first for a smooth transition
    router.push("/shop/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Your Cart</h2>
          <button onClick={onClose} className="text-2xl hover:rotate-90 transition-transform">✕</button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <span className="text-5xl mb-4">🛒</span>
              <p className="font-bold uppercase text-xs tracking-widest">Cart is empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <p className="font-black uppercase text-sm leading-tight">{item.product.name}</p>
                  <p className="text-violet-600 font-bold text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="font-black text-stone-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-8 bg-stone-50 border-t border-stone-100">
          <div className="flex justify-between items-end mb-6">
            <span className="font-bold text-stone-400 uppercase text-xs tracking-widest">Subtotal</span>
            <span className="text-3xl font-black text-stone-900">${subtotal.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckoutNavigation}
            disabled={cart.length === 0}
            className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {cart.length === 0 ? "Add items to start" : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}