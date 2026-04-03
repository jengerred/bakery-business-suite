"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- SUB-COMPONENT: SECURE PAYMENT SECTION ---
function PaymentSection({ onBack, finalTotal, cart, method, onSwitchToToggle }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/success" },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center border-b border-violet-100 pb-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Secure Checkout</h3>
        <button type="button" onClick={onBack} className="text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:text-violet-700 transition-colors">
          ← Edit Details
        </button>
      </div>

      <div className="p-1 min-h-[300px]">
        <PaymentElement options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'cashapp', 'venmo'],
          wallets: { applePay: 'auto', googlePay: 'auto' },
          business: { name: "Veronica Bowens Bakery" },
          terms: { card: 'never' }
        }} />
      </div>

      <OrderSummary 
        cart={cart} 
        method={method} 
        subtotal={finalTotal - (method === 'shipping' ? 12 : 0)} 
        finalTotal={finalTotal} 
        onSwitchToToggle={onSwitchToToggle}
      />

      <div className="space-y-6">
        <button
          onClick={handleFinalSubmit}
          disabled={loading || !stripe}
          className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : `Confirm & Pay $${finalTotal.toFixed(2)}`}
        </button>
        
        <div className="relative flex flex-col items-center justify-center py-6 overflow-hidden text-center">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-stone-200"></div>
            <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-3">
                    <span className="text-lg opacity-80">🔒</span>
                    <div className="silver-shine-text">
                      <span className="text-[13px] font-black uppercase tracking-[0.35em] italic">
                          Secure Encrypted Checkout
                      </span>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] leading-relaxed">
                    We never store your payment info <br/>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE SUMMARY ---
function OrderSummary({ cart, method, subtotal, finalTotal, onSwitchToToggle }: any) {
    return (
        <section className="pt-4 border-t border-stone-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
                {cart.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-stone-600">{item.quantity}x {item.product.name}</span>
                        <span className="font-bold text-stone-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                
                <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className={`${method === 'shipping' ? 'text-violet-600' : 'text-stone-500'} font-bold`}>
                            {method === 'shipping' ? 'Flat Rate Shipping' : 'Local Pickup'}
                        </span>
                        {onSwitchToToggle && (
                            <button onClick={onSwitchToToggle} className="text-[11px] text-violet-400 uppercase tracking-tight text-left underline decoration-violet-200 hover:text-violet-800 transition-all">
                                {method === 'shipping' ? '⇆ Switch to Free Pickup?' : '⇆ Switch to Shipping?'}
                            </button>
                        )}
                    </div>
                    <span className={`${method === 'shipping' ? 'text-violet-600' : 'text-stone-900'} font-bold`}>
                        {method === 'shipping' ? '$12.00' : 'FREE'}
                    </span>
                </div>
            </div>
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-stone-900 uppercase tracking-wider">Total Due</span>
                    <span className="text-3xl font-bold text-stone-900 tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>
            </div>
        </section>
    );
}

export default function CartDrawer({ isOpen, onClose, cart }: any) {
  const [view, setView] = useState<"methods" | "details" | "payment" | "success">("methods");
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });
  const [showErrors, setShowErrors] = useState(false);

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
        .silver-shine-text span {
          background: linear-gradient(to right, #44403c 0%, #a8a29e 25%, #ffffff 50%, #a8a29e 75%, #44403c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: liquid-silver 12s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
      
      <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="px-8 pt-8 pb-6 border-b border-stone-100 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-[0.15em] text-violet-600 hover:text-violet-800 transition-all flex items-center gap-1 group"
          >
            <span className="text-xs group-hover:-translate-x-1 transition-transform">←</span>
            Continue Shopping
          </button>
          
          <div className="text-center mt-6">
            <h1 className="text-sm font-bold text-stone-900 leading-tight">
              Veronica Bowens <br/>
              <span className="italic text-violet-600 text-base uppercase tracking-tight">Mothers Secret Recipe</span> <br/>
              <span className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-black">Bakery</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === "methods" && (
            <div className="space-y-8">
              <OrderSummary cart={cart} method={null} subtotal={subtotal} finalTotal={subtotal} />
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

          {view === "details" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-violet-100 pb-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Your Details</h3>
                <button onClick={() => setView("methods")} className="text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:text-violet-800">← Back</button>
              </div>

              <div className="space-y-3">
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass(formData.name)} placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass(formData.phone)} placeholder="Phone" />
                  <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass(formData.email)} placeholder="Email" />
                </div>
                {method === 'shipping' && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputClass(formData.address)} placeholder="Street Address" />
                    <div className="grid grid-cols-2 gap-3">
                       <input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={inputClass(formData.city)} placeholder="City" />
                       <input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} className={inputClass(formData.zip)} placeholder="Zip Code" />
                    </div>
                  </div>
                )}
                {showErrors && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider text-center pt-2">
                        ⚠️ Please fill in all required fields
                    </p>
                )}
              </div>

              <OrderSummary cart={cart} method={method} subtotal={subtotal} finalTotal={finalTotal} onSwitchToToggle={handleToggleMethod} />

              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleAction("payment")} className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                  Pay Now
                </button>
                
                {method === 'pickup' && (
                  <button onClick={() => handleAction("success")} className="w-full py-5 bg-white border-2 border-stone-200 text-stone-600 rounded-[2rem] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all">
                    Pay at Pickup
                  </button>
                )}
              </div>
            </div>
          )}

          {view === "payment" && (
            <Elements stripe={stripePromise} options={{ mode: 'payment', amount: Math.round(finalTotal * 100), currency: 'usd' }}>
              <PaymentSection finalTotal={finalTotal} onBack={() => setView("details")} cart={cart} method={method} onSwitchToToggle={handleToggleMethod} />
            </Elements>
          )}

         {view === "success" && (
  <div className="text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500">
    <div className="relative inline-block">
      <span className="text-6xl">✨</span>
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-violet-400 rounded-full animate-ping"></div>
    </div>
    
    <div className="space-y-2">
      <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
        Order Reserved!
      </h2>
      <p className="text-stone-500 font-medium leading-relaxed max-w-[280px] mx-auto text-sm">
        Check your <span className="text-violet-600 font-bold">Email</span> and <span className="text-violet-600 font-bold">Texts</span>. 
        We've sent your receipt and pickup details there!
      </p>
    </div>

    <div className="pt-4">
      <button 
        onClick={onClose} 
        className="w-full py-5 bg-stone-950 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-violet-600 transition-all active:scale-95"
      >
        Back to Shop
      </button>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}