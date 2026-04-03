"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", apt: "", city: "", state: "", zip: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const cartSubtotal = 20.00; 
  const shippingFee = method === "shipping" ? 12.00 : 0;
  const total = cartSubtotal + shippingFee;

  const validate = () => {
    const newErrors: string[] = [];
    if (!formData.firstName) newErrors.push("firstName");
    if (!formData.lastName) newErrors.push("lastName");
    if (!formData.phone && !formData.email) newErrors.push("phone", "email");
    if (method === "shipping") {
      if (!formData.address) newErrors.push("address");
      if (!formData.city) newErrors.push("city");
      if (!formData.state) newErrors.push("state");
      if (!formData.zip) newErrors.push("zip");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleOnlinePayment = async () => {
    if (!validate()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          method: method,
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || "Failed to initialize payment");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("There was an issue connecting to Stripe. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayLater = () => {
    if (validate()) alert("Order Placed! Please bring payment to Nextech High at pickup. 🍪");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-8 text-stone-900 font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        @keyframes silver-pulse {
          0% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.4); }
          100% { opacity: 0.8; filter: brightness(1); }
        }
        .silver-shine {
          background: linear-gradient(to bottom, #FFFFFF 0%, #A8A8A8 50%, #FFFFFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: silver-pulse 3s infinite ease-in-out;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
            <Link href="/shop" className="text-sm font-bold text-violet-600 mb-4 inline-block hover:translate-x-[-4px] transition-transform">
            ← Back to Shop
            </Link>
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">Finalize Your Order</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* LEFT: FORM FIELDS */}
          <div className="md:col-span-7 space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-violet-900">1. Delivery Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    disabled={!!clientSecret}
                    onClick={() => setMethod("pickup")} 
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${method === "pickup" ? "border-violet-600 bg-violet-50" : "border-stone-100 opacity-60"}`}
                >
                  <span className="text-3xl mb-2 block">🛍️</span>
                  <span className="font-bold">Local Pickup</span>
                  <p className="text-xs text-violet-600 font-semibold mt-1">Nextech High · Fri @ 12pm</p>
                </button>
                <button 
                    disabled={!!clientSecret}
                    onClick={() => setMethod("shipping")} 
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${method === "shipping" ? "border-violet-600 bg-violet-50" : "border-stone-100 opacity-60"}`}
                >
                  <span className="text-3xl mb-2 block">📦</span>
                  <span className="font-bold">Nationwide Shipping</span>
                  <p className="text-xs text-violet-600 font-semibold mt-1">Freshly Sent Fridays</p>
                </button>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-violet-900">2. Customer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} className={`p-4 bg-stone-50 rounded-xl border ${errors.includes('firstName') ? 'border-red-500' : 'border-stone-200'} outline-none focus:border-violet-600 transition-all`} />
                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} className={`p-4 bg-stone-50 rounded-xl border ${errors.includes('lastName') ? 'border-red-500' : 'border-stone-200'} outline-none focus:border-violet-600 transition-all`} />
              </div>

              {method === "shipping" && (
                <div className="space-y-4 pt-4 border-t border-stone-100 animate-in fade-in">
                  <input type="text" placeholder="Street Address" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className={`w-full p-4 bg-stone-50 rounded-xl border ${errors.includes('address') ? 'border-red-500' : 'border-stone-200'} outline-none focus:border-violet-600`} />
                  <input type="text" placeholder="Apt, Suite, Unit (Optional)" value={formData.apt} onChange={(e)=>setFormData({...formData, apt: e.target.value})} className="w-full p-4 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-violet-600" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} className={`p-4 bg-stone-50 rounded-xl border ${errors.includes('city') ? 'border-red-500' : 'border-stone-200'} outline-none focus:border-violet-600`} />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="ST" value={formData.state} onChange={(e)=>setFormData({...formData, state: e.target.value})} className={`p-4 bg-stone-50 rounded-xl border ${errors.includes('state') ? 'border-red-500' : 'border-stone-200'} text-center`} />
                        <input type="text" placeholder="Zip" value={formData.zip} onChange={(e)=>setFormData({...formData, zip: e.target.value})} className={`p-4 bg-stone-50 rounded-xl border ${errors.includes('zip') ? 'border-red-500' : 'border-stone-200'}`} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-stone-100">
                <p className="text-sm font-bold text-violet-900">How should we reach you? (At least one)</p>
                <input type="tel" placeholder="Mobile Number" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className={`w-full p-4 bg-stone-50 rounded-xl border ${errors.includes('phone') ? 'border-red-200' : 'border-stone-200'} outline-none focus:border-violet-600`} />
                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className={`w-full p-4 bg-stone-50 rounded-xl border ${errors.includes('email') ? 'border-red-200' : 'border-stone-200'} outline-none focus:border-violet-600`} />
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY & STRIPE ELEMENT */}
          <div className="md:col-span-5">
            <div className="bg-violet-900 text-white p-8 rounded-[2.5rem] sticky top-24 shadow-2xl shadow-violet-200 transition-all duration-500">
              <h3 className="text-xl font-bold mb-8 text-center text-violet-100">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-medium text-violet-200">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {method === "shipping" && (
                  <div className="flex justify-between text-sm font-medium text-violet-200">
                    <span>Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-white/20 flex justify-between items-end">
                  <span className="text-sm font-bold text-violet-100">Total Due</span>
                  <span className="text-4xl font-extrabold tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="space-y-3">
                {clientSecret ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <Elements 
                        stripe={stripePromise} 
                        options={{ 
                            clientSecret, 
                            appearance: { 
                                theme: 'night', 
                                variables: { colorPrimary: '#ffffff', colorBackground: '#2e1065' } 
                            } 
                        }}
                    >
                      <StripeForm total={total} />
                    </Elements>
                    <button 
                        onClick={() => setClientSecret("")}
                        className="w-full mt-4 text-xs font-bold text-violet-300 hover:text-white"
                    >
                        ← Change Payment Method
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                        onClick={handleOnlinePayment}
                        disabled={isProcessing}
                        className="w-full py-5 bg-white text-violet-900 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.96] disabled:opacity-50"
                    >
                        {isProcessing ? "Connecting..." : "Pay Now"}
                    </button>

                    {method === "pickup" && (
                        <button 
                            onClick={handlePayLater}
                            disabled={isProcessing}
                            className="w-full py-4 bg-violet-800 text-white border-2 border-violet-700 rounded-2xl font-bold text-sm hover:bg-violet-700 transition-all disabled:opacity-50"
                        >
                            Pay in Person
                        </button>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="w-full h-[1px] bg-white/10 mb-4"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] silver-shine">Secure Checkout</span>
                  <span className="text-xs animate-pulse">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner Component for Stripe Elements
function StripeForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && <div className="text-red-400 text-xs font-bold bg-red-900/20 p-3 rounded-lg">{errorMessage}</div>}
      <button 
        disabled={!stripe || loading}
        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
      >
        {loading ? "Processing..." : `Confirm $${total.toFixed(2)}`}
      </button>
    </form>
  );
}