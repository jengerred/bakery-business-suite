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
  onDecrement,
  onUpdateQuantity, 
  onRemove,
}: any) {
  const [view, setView] = useState<"methods" | "details" | "payment" | "success">("methods");
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = method === "shipping" ? 12.00 : 0;
  const finalTotal = subtotal + shippingFee;

  /* -----------------------------------------------------------
     🚀 BACKEND INTEGRATION (23-Column Sync)
  ----------------------------------------------------------- */
  const handleSubmitOrder = async (paymentType: "card" | "cash", stripeId?: string) => { 
    setIsSubmitting(true);

    // 1. Construct the data object exactly as C# expects it
    const orderData = {
      Items: cart.map((item: any) => ({
        Product: item.product,
        Quantity: item.quantity
      })),
      Subtotal: subtotal,
      Tax: 0, 
      Total: finalTotal,
      CustomerName: formData.name,
      CustomerEmail: formData.email,
      CustomerPhone: formData.phone,
      CustomerId: "", 
      FulfillmentType: method === "shipping" ? "Delivery" : "Pickup",

      // ✅ FIX: PickupTime must be a valid ISO string for the C# DateTime parser
      PickupTime: new Date().toISOString(), 

      Status: "paid",
      Address: formData.address || "In-Store",
      City: formData.city || "Grand Rapids",
      State: "MI", 
      Zip: formData.zip || "",

      // ✅ FIX: Move "Friday @ 12:00 PM" to Notes so it doesn't crash the Date column
      Notes: method === "pickup" ? "Friday @ 12:00 PM" : "Online Order",

      PaymentType: paymentType === "card" ? "Card" : "Cash",
      CardEntryMethod: paymentType === "card" ? "online" : "none",
      StripePaymentId: stripeId || "",
      CashTendered: 0, 
      ChangeGiven: 0   
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ FIX: Wrapped in 'dto' key to satisfy [FromBody] OrderDto dto
        body: JSON.stringify({ dto: orderData }),
      });

      if (res.ok) {
        setView("success");
      } else {
        const err = await res.json();
        console.error("Validation Errors:", err);
        alert(`Order failed: ${JSON.stringify(err.errors || err)}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Could not connect to Railway backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = (nextView: "payment" | "success") => {
    if (isFormValid()) {
      if (nextView === "success") {
        handleSubmitOrder("cash");
      } else {
        setView(nextView);
      }
      setShowErrors(false);
    } else {
      setShowErrors(true);
    }
  };

  const isFormValid = () => {
    const baseFields = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
    if (method === "shipping") {
      return baseFields && formData.address.trim() !== "" && formData.city.trim() !== "" && formData.zip.trim() !== "";
    }
    return baseFields;
  };

  const inputClass = (value: string) => `
    w-full p-4 bg-stone-50 rounded-xl border-2 font-bold text-sm transition-all outline-none
    ${showErrors && value.trim() === "" 
        ? "border-red-400 bg-red-50 animate-shake" 
        : "border-transparent focus:border-violet-100 focus:bg-white"
    }
  `;

  if (!isOpen) return null;

  const handleToggleMethod = () => {
    setMethod(prev => prev === 'pickup' ? 'shipping' : 'pickup');
    if (view === "payment") setView("details");
    setShowErrors(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
      
      <div className="absolute inset-0 bg-violet-400/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100 relative shrink-0 text-center">
          {view !== "success" && (
            <div className="p-3 bg-violet-100/50 rounded-3xl border-2 border-violet-600 text-center w-50 hover:bg-violet-200">
              <button
                onClick={() => { setView("methods"); setShowErrors(false); onClose(); }}
                className="p-1 absolute top-8 left-8 text-[10px] font-black uppercase tracking-[0.15em] text-violet-600 hover:text-violet-800 transition-all flex items-center gap-2 group"
              >
                <span className="pl-2 mb-1 text-sm group-hover:-translate-x-1 transition-transform">←</span>
                Continue Shopping
              </button>
            </div>
          )}
          <h1 className="text-sm font-bold text-stone-900 leading-tight mt-6">
            Veronica Bowens <br/>
            <span className="italic text-violet-600 text-base uppercase tracking-tight">Mothers Secret Recipe</span> <br/>
            <span className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-black">Bakery</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === "methods" && (
            <div className="p-1">
              <OrderSummary cart={cart} method={null} subtotal={subtotal} finalTotal={subtotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
              <div className="space-y-3 mt-4">
                <div className="p-5 rounded-3xl border-2 border-violet-300/50 border-dashed bg-violet-100 shadow-inner">
                  <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Pickup or Shipping?</h3>
                  <button onClick={() => { setMethod("pickup"); setView("details"); }} className="w-full p-5 bg-white border-2 border-violet-200 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🛍️</span>
                      <div className="text-left">
                        <p className="font-bold uppercase text-sm">Pickup @ Nextech High</p>
                        <p className="text-sm text-violet-600 font-bold uppercase mt-1 italic">Free • Fridays @ 12:00 PM</p>
                      </div>
                    </div>
                    <span className="text-stone-300 group-hover:text-violet-600 font-bold">→</span>
                  </button>
                  <button onClick={() => { setMethod("shipping"); setMethod("shipping"); setView("details"); }} className="w-full p-5 bg-white border-2 border-violet-200 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group">
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
            </div>
          )}

          {view === "details" && (
            <div className="space-y-3">
              <div className="mb-8 p-5 rounded-3xl border-2 border-violet-300/50 border-dashed bg-violet-100 shadow-inner space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">
                  {method === "shipping" ? "Shipping Details" : "Pickup Details"}
                </h3>
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

              <OrderSummary cart={cart} method={method} subtotal={subtotal} finalTotal={finalTotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />

              <div className="grid grid-cols-1 gap-3">
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleAction("payment")} 
                  className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  Pay Now
                </button>
                {method === 'pickup' && (
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleAction("success")} 
                    className="w-full py-5 bg-white border-2 border-stone-200 text-stone-600 rounded-[2rem] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Pay at Pickup"}
                  </button>
                )}
              </div>
            </div>
          )}

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
              onPaymentSuccess={(stripeId) => handleSubmitOrder("card", stripeId)}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
            </Elements>
          )}

          {view === "success" && (
            <div className="text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block">
                <span className="text-6xl">✨</span>
                <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🍪</span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
                {method === "shipping" ? "Order Placed!" : "Order Reserved!"}
              </h2>
              <button onClick={() => window.location.reload()} className="w-full py-5 bg-stone-950 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em]">
                Back to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}