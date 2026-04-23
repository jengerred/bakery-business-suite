"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";
import { userService } from "../../lib/userService";
import LoginModal from "../LoginModal"; 

/* -------------------------------------------------------
   👤 User Context
   Used to trigger login and auto-fill profile details.
------------------------------------------------------- */
import { useUser } from "../../context/UserContext";

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
  
  /* -------------------------------------------------------
     State & Context Hooks
  ------------------------------------------------------- */
  const { user, setUser } = useUser();
  const [view, setView] = useState<"methods" | "details" | "payment" | "success">("methods");
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); 

  /* -------------------------------------------------------
     ✨ Auto-Fill Logic
  ------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        zip: user.zip || ""
      }));
    }
  }, [user]);

  /* -------------------------------------------------------
     Calculations
  ------------------------------------------------------- */
  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = method === "shipping" ? 12.00 : 0;
  const finalTotal = subtotal + shippingFee;

  /* -------------------------------------------------------
     👤 Login Trigger Logic
  ------------------------------------------------------- */
  const handleSelectMethod = (selected: "pickup" | "shipping") => {
    setMethod(selected);
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setView("details");
    }
  };

  /* -------------------------------------------------------
     🚀 Order Submission & Profile Sync
     - Normalizes email to lowercase for case-insensitivity.
     - Strips non-digits from phone numbers.
  ------------------------------------------------------- */
  const handleSubmitOrder = async (paymentType: "card" | "cash", stripeId?: string) => { 
    setIsSubmitting(true);

    // Normalize data for consistency
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // 👤 1. Sync Profile Data
    if (user && user.id) {
      try {
        const updatedUser = await userService.update(user.id, {
          ...formData,
          email: cleanEmail,
          phone: cleanPhone
        });
        setUser(updatedUser);
      } catch (err) {
        console.error("⚠️ Profile sync failed, but continuing with order...");
      }
    }

    // 📦 2. Construct Order Payload
    const orderData = {
      items: cart.map((item: any) => ({
        product: item.product,
        quantity: item.quantity
      })),
      subtotal,
      tax: 0,
      total: finalTotal,
      customerName: formData.name,
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
      customerId: user?.id || "", 
      fulfillmentType: method === "shipping" ? "shipping" : "pickup",
      pickupTime: null,
      status: paymentType === "card" ? "paid" : "pending",
      address: method === "shipping" ? formData.address : null,
      city: method === "shipping" ? formData.city : null,
      state: "MI",
      zip: method === "shipping" ? formData.zip : null,
      notes: method === "pickup" ? "Pickup order" : "Online shipping order",
      paymentType: paymentType === "card" ? "card" : "unpaid",
      cardEntryMethod: paymentType === "card" ? "online" : "",
      stripePaymentId: stripeId || "",
      cashTendered: null,
      changeGiven: null
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        setView("success");
      } else {
        const err = await res.json();
        alert(`Order failed: ${JSON.stringify(err.errors || err)}`);
      }
    } catch (err) {
      alert("Could not connect to Railway backend.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /* -------------------------------------------------------
     Navigation & Validation Logic
  ------------------------------------------------------- */
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, "");
    
    const isNameValid = formData.name.trim().length >= 2;
    const isEmailValid = emailRegex.test(formData.email);
    const isPhoneValid = phoneDigits.length === 10;

    const baseFields = isNameValid && isEmailValid && isPhoneValid;

    if (method === "shipping") {
      const isZipValid = /^\d{5}$/.test(formData.zip);
      return baseFields && formData.address.trim() !== "" && formData.city.trim() !== "" && isZipValid;
    }
    return baseFields;
  };

  // Determines if a specific field should show as "Invalid" (Red)
  const isFieldInvalid = (fieldName: string, value: string) => {
    if (!showErrors) return false;
    if (value.trim() === "") return true;

    if (fieldName === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (fieldName === "phone") return value.replace(/\D/g, "").length !== 10;
    if (fieldName === "zip") return !/^\d{5}$/.test(value);
    
    return false;
  };

  const inputClass = (fieldName: string, value: string) => `
    w-full p-4 bg-stone-50 rounded-xl border-2 font-bold text-sm transition-all outline-none
    ${isFieldInvalid(fieldName, value)
        ? "border-red-400 bg-red-50 animate-shake" 
        : "border-transparent focus:border-violet-100 focus:bg-white"
    }
  `;

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

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* VIEW: METHODS */}
          {view === "methods" && (
            <div className="p-1">
              <OrderSummary cart={cart} method={method} subtotal={subtotal} finalTotal={subtotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
              <div className="space-y-3 mt-4">
                <div className="p-5 rounded-3xl border-2 border-violet-300/50 border-dashed bg-violet-100 shadow-inner">
                  <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Pickup or Shipping?</h3>
                  <button onClick={() => handleSelectMethod("pickup")} className="w-full p-5 bg-white border-2 border-violet-200 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🛍️</span>
                      <div className="text-left">
                        <p className="font-bold uppercase text-sm">Pickup @ Nextech High</p>
                        <p className="text-sm text-violet-600 font-bold uppercase mt-1 italic">Free • Fridays @ 12:00 PM</p>
                      </div>
                    </div>
                    <span className="text-stone-300 group-hover:text-violet-600 font-bold">→</span>
                  </button>
                  <button onClick={() => handleSelectMethod("shipping")} className="w-full p-5 bg-white border-2 border-violet-200 rounded-3xl hover:border-violet-600 transition-all flex items-center justify-between group">
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

          {/* VIEW: DETAILS */}
          {view === "details" && (
            <div className="space-y-3">
              <div className="mb-8 p-5 rounded-3xl border-2 border-violet-300/50 border-dashed bg-violet-100 shadow-inner space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">
                  {method === "shipping" ? "Shipping Details" : "Pickup Details"}
                </h3>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass("name", formData.name)} placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass("phone", formData.phone)} placeholder="Phone" />
                  <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass("email", formData.email)} placeholder="Email" />
                </div>
                {method === "shipping" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputClass("address", formData.address)} placeholder="Shipping Address" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={inputClass("city", formData.city)} placeholder="City" />
                      <input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} className={inputClass("zip", formData.zip)} placeholder="Zip Code" />
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
                  {isSubmitting ? "Processing..." : "Pay Now"}
                </button>
                {method === 'pickup' && (
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleAction("success")} 
                    className="w-full py-5 bg-white border-2 border-stone-200 text-stone-600 rounded-[2rem] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    Pay at Pickup
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW: PAYMENT */}
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

          {/* VIEW: SUCCESS */}
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

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => {
          setIsLoginOpen(false);
          setView("details"); 
        }} 
      />
    </div>
  );
}