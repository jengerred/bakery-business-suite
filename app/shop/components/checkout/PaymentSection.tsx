"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import OrderSummary from "./OrderSummary";

interface PaymentSectionProps {
  onBack: () => void;
  finalTotal: number;
  cart: any[];
  method: "pickup" | "shipping";
  onSwitchToToggle: () => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onPaymentSuccess: () => void; // New prop to trigger internal success view
}

export default function PaymentSection({ 
  onBack, 
  finalTotal, 
  cart, 
  method, 
  onSwitchToToggle,
  onIncrement,
  onDecrement,
  onPaymentSuccess
}: PaymentSectionProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // 1. Validate the form fields first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      alert(submitError.message);
      setLoading(false);
      return;
    }

    try {
      // 2. Fetch the clientSecret from your API
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Math.round(finalTotal * 100), 
          cart: cart.map(item => ({ id: item.product.id, quantity: item.quantity }))
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create intent");

      // 3. Confirm the payment WITHOUT mandatory redirect
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        redirect: "if_required", // This prevents redirecting for standard cards
        confirmParams: { 
          return_url: `${window.location.origin}/shop`,
        },
      });

      if (error) {
        alert(error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // --- SUCCESS ---
        // Instead of a new page, we trigger the internal success state
        onPaymentSuccess();
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <style jsx>{`
        @keyframes liquid-silver {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .silver-shine-text {
          background: linear-gradient(to right, #44403c 0%, #a8a29e 25%, #ffffff 50%, #a8a29e 75%, #44403c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: liquid-silver 12s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-violet-100 pb-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">
          Secure Checkout
        </h3>
        <button 
          type="button" 
          onClick={onBack} 
          className="text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:text-violet-700 transition-colors"
        >
          ← Edit Details
        </button>
      </div>

      {/* Stripe Payment Element */}
      <div className="p-1 min-h-[300px]">
        <PaymentElement options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          business: { name: "Veronica Bowens Bakery" },
        }} />
      </div>

      <OrderSummary 
        cart={cart} 
        method={method} 
        subtotal={finalTotal - (method === 'shipping' ? 12 : 0)} 
        finalTotal={finalTotal} 
        onSwitchToToggle={onSwitchToToggle}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />

      <div className="space-y-6">
        <button
          onClick={handleFinalSubmit}
          disabled={loading || !stripe}
          className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : `Confirm & Pay $${finalTotal.toFixed(2)}`}
        </button>
        
        {/* Branding & Security Footer */}
        <div className="relative flex flex-col items-center justify-center py-6 overflow-hidden text-center border-t border-stone-100 mt-4">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-lg opacity-80">🔒</span>
                    <div className="silver-shine-text">
                      <span className="text-[13px] font-black uppercase tracking-[0.35em] italic">
                          Secure Encrypted Checkout
                      </span>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] leading-relaxed">
                    We never store your payment info
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}