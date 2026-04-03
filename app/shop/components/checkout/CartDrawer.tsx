"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onIncrement, 
  onDecrement 
}: any) {
  const [view, setView] = useState<"methods" | "details" | "payment" | "success">("methods");
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });
  const [showErrors, setShowErrors] = useState(false);

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = method === "shipping" ? 12.00 : 0;
  const finalTotal = subtotal + shippingFee;

  const handleToggleMethod = () => {
    setMethod(prev => prev === 'pickup' ? 'shipping' : 'pickup');
    if (view === "payment") setView("details");
    setShowErrors(false);
  };

  const isFormValid = () => {
    const baseFields = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
    if (method === "shipping") {
      return baseFields && formData.address.trim() !== "" && formData.city.trim() !== "" && formData.zip.trim() !== "";
    }
    return baseFields;
  };

  const handleAction = (nextView: "payment" | "success") => {
    if (isFormValid()) {
      setView(nextView);
      setShowErrors(false);
    } else {
      setShowErrors(true);
    }
  };

  const inputClass = (value: string) => `
    w-full p-4 bg-stone-50 rounded-xl border-2 font-bold text-sm transition-all outline-none
    ${showErrors && value.trim() === "" 
        ? "border-red-400 bg-red-50 animate-shake" 
        : "border-transparent focus:border-violet-100 focus:bg-white"
    }
  `;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style jsx global>{`
        @keyframes liquid-silver {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
      
      <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100 relative shrink-0 text-center">
          {view !== "success" && (
            <button 
              onClick={onClose}
              className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-[0.15em] text-violet-600 hover:text-violet-800 transition-all flex items-center gap-1 group"
            >
              <span className="text-xs group-hover:-translate-x-1 transition-transform">←</span>
              Back
            </button>
          )}
          
          <h1 className="text-sm font-bold text-stone-900 leading-tight mt-6">
            Veronica Bowens <br/>
            <span className="italic text-violet-600 text-base uppercase tracking-tight">Mothers Secret Recipe</span> <br/>
            <span className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-black">Bakery</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* VIEW 1: METHOD SELECTION */}
          {view === "methods" && (
            <div className="space-y-8">
              <OrderSummary 
                cart={cart} 
                method={null} 
                subtotal={subtotal} 
                finalTotal={subtotal} 
                onIncrement={onIncrement}
                onDecrement={onDecrement}
              />
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Delivery Method</h3>
                <button onClick={() => { setMethod("pickup"); setView("details"); }} className="w-full p-5 bg-white border-2 border-stone-100 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🛍️</span>
                    <div className="text-left">
                      <p className="font-bold uppercase text-sm">Pickup @ Nextech High</p>
                      <p className="text-sm text-violet-600 font-bold uppercase mt-1 italic">Free • Fridays @ 12:00 PM</p>
                    </div>
                  </div>
                  <span className="text-stone-300 group-hover:text-violet-600 font-bold">→</span>
                </button>
                <button onClick={() => { setMethod("shipping"); setView("details"); }} className="w-full p-5 bg-white border-2 border-stone-100 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">📦</span>
                    <div className="text-left">
                      <p className="font-bold uppercase text-sm">Nationwide Shipping</p>
                      <p className="text-sm text-violet-600 font-bold uppercase mt-1 italic">+$12.00</p>
                    </div>
                  </div>
                  <span className="text-stone-300 group-hover:text-violet-600 font-bold">→</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: DETAILS & SUMMARY */}
          {view === "details" && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Customer Details</h3>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass(formData.name)} placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass(formData.phone)} placeholder="Phone" />
                  <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass(formData.email)} placeholder="Email" />
                </div>
                {method === "shipping" && (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                     <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputClass(formData.address)} placeholder="Shipping Address" />
                     <div className="grid grid-cols-2 gap-3">
                        <input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={inputClass(formData.city)} placeholder="City" />
                        <input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} className={inputClass(formData.zip)} placeholder="Zip Code" />
                     </div>
                   </div>
                )}
              </div>

              <OrderSummary 
                cart={cart} 
                method={method} 
                subtotal={subtotal} 
                finalTotal={finalTotal} 
                onSwitchToToggle={handleToggleMethod}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
              />

              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleAction("payment")} className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                  Proceed to Payment
                </button>
                {method === 'pickup' && (
                  <button onClick={() => handleAction("success")} className="w-full py-5 bg-white border-2 border-stone-200 text-stone-600 rounded-[2rem] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all">
                    Pay at Pickup
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: STRIPE PAYMENT */}
          {view === "payment" && (
            <Elements stripe={stripePromise} options={{ 
                mode: 'payment', 
                amount: Math.round(finalTotal * 100), 
                currency: 'usd',
                appearance: { theme: 'stripe' }
            }}>
              <PaymentSection 
                finalTotal={finalTotal} 
                onBack={() => setView("details")} 
                cart={cart} 
                method={method} 
                onSwitchToToggle={handleToggleMethod} 
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onPaymentSuccess={() => setView("success")}
              />
            </Elements>
          )}

          {/* VIEW 4: SUCCESS (REFRESH LOGIC) */}
          {view === "success" && (
            <div className="text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block">
                <span className="text-6xl">✨</span>
                <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🍪</span>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
                  {method === "shipping" ? "Order Placed!" : "Order Reserved!"}
                </h2>
                
                <div className="px-8">
                  {method === "shipping" ? (
                    <p className="text-sm text-stone-600 font-medium leading-relaxed">
                      We ship our products <span className="font-black text-violet-600 underline decoration-violet-200">every Friday</span>. 
                      Keep an eye on your inbox—we’ll send email and text updates as your treats head your way!
                    </p>
                  ) : (
                    <p className="text-sm text-stone-600 font-medium leading-relaxed">
                      Your cookies are locked in! We’ll see you this 
                      <span className="font-black text-violet-600"> Friday @ 12:00PM </span> 
                      at Nextech High for pickup.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 px-8">
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-5 bg-stone-950 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-stone-800 transition-all active:scale-95"
                >
                  Back to Shop
                </button>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Thank you for supporting local
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}