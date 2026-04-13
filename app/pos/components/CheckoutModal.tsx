"use client";

/* -------------------------------------------------------
   📦 React + Stripe Dependencies
------------------------------------------------------- */
import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";

/* -------------------------------------------------------
   🧱 UI Components & Types
------------------------------------------------------- */
import { Product } from "@/app/types/product";   // Backend Product type
import { useTerminalSimulation } from "../hooks/useTerminalSimulation";

type CheckoutModalProps = {
  order: { product: Product; quantity: number; overridePrice?: number }[];
  terminal: ReturnType<typeof useTerminalSimulation>;
  forceReaderMode?: boolean;
  onClose: () => void;
  onComplete: (data: {
    // Identity & Time
    id?: string;
    timestamp: string;
    
    // The Items (Column 2)
    items: { product: Product; quantity: number }[];

    // Accounting
    subtotal: number;
    tax: number;
    total: number;

    // Payment Logic
    paymentType: "cash" | "credit" | "debit";
    cardEntryMethod?: "manual" | "terminal" | "none";
    cashTendered?: number;
    changeGiven?: number;
    stripePaymentId?: string;

    // Customer & Fulfillment (Columns 11-23)
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    status: string;
    fulfillmentType: string;
    pickupTime: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  }) => void;
};

export default function CheckoutModal({
  order,
  terminal,
  forceReaderMode = false,
  onClose,
  onComplete,
}: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "debit">("cash");
  const [cardEntryMethod, setCardEntryMethod] = useState<"manual" | "terminal">("manual");
  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [readerStatus, setReaderStatus] = useState<string | null>(null);

  /* -------------------------------------------------------
     🧮 Calculations
  ------------------------------------------------------- */
  const subtotal = order.reduce((sum, item) => {
    const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
    return sum + (activePrice * item.quantity);
  }, 0);

  const taxableSubtotal = order.reduce((sum, item) => {
    if (item.product.taxable) {
      const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
      return sum + (activePrice * item.quantity);
    }
    return sum;
  }, 0);

  const tax = taxableSubtotal * 0.06; 
  const total = subtotal + tax;
  const changeDue = Number(cashTendered) > 0 ? Number(cashTendered) - total : 0;

  /* -------------------------------------------------------
     📡 Shared Metadata (The 23-Column Bridge)
  ------------------------------------------------------- */
  const commonOrderData = {
    items: order,
    subtotal,
    tax,
    total,
    timestamp: new Date().toISOString(),
    // Defaulting these to ensure Supabase columns aren't NULL
    customerName: "Guest",
    customerEmail: "",
    customerPhone: "",
    customerId: "walk-in",
    status: "paid",
    fulfillmentType: "POS",
    pickupTime: "Immediate",
    address: "In-Store",
    city: "Grand Rapids",
    state: "MI",
    zip: "",
    notes: ""
  };

  /* -------------------------------------------------------
     💳 Terminal Handler
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReaderStatus(e: any) { 
      const status = e.detail.status;
      setReaderStatus(status);
      if (status === "collecting" || status === "processing") {
        setPaymentType("credit");
        setCardEntryMethod("terminal");
      }
    }
    
    function handleReaderComplete(e: any) {
      setReaderStatus("approved");
      setTimeout(() => {
        onComplete({ 
          ...commonOrderData,
          paymentType: e.detail.paymentType, 
          cardEntryMethod: e.detail.cardEntryMethod,
          stripePaymentId: e.detail.stripePaymentId || "terminal_ref"
        });
      }, 1200);
    }

    window.addEventListener("reader-status-update", handleReaderStatus);
    window.addEventListener("reader-payment-complete", handleReaderComplete);
    return () => {
      window.removeEventListener("reader-status-update", handleReaderStatus);
      window.removeEventListener("reader-payment-complete", handleReaderComplete);
    };
  }, [onComplete, commonOrderData]);

  /* -------------------------------------------------------
     💳 Manual Stripe Handler
  ------------------------------------------------------- */
  async function handleManualCardPayment() {
    if (!stripe || !elements) return;
    setLoading(true);

    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount: Math.round(total * 100) }),
    });

    const { clientSecret, error } = await res.json();
    if (error || !clientSecret) {
      toast.error("Payment error: " + error);
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error.message || "Payment Failed");
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      toast.success("Payment successful!");
      onComplete({
        ...commonOrderData,
        paymentType,
        cardEntryMethod: "manual",
        stripePaymentId: result.paymentIntent.id,
      });
    }
  }

  /* -------------------------------------------------------
     💵 Cash Handler
  ------------------------------------------------------- */
  function handleCashPayment() {
    onComplete({
      ...commonOrderData,
      paymentType: "cash",
      cashTendered: Number(cashTendered),
      changeGiven: changeDue,
      cardEntryMethod: "none"
    });
    window.dispatchEvent(new CustomEvent("reader-show-thank-you"));
  }

  return (
    <div className="fixed top-0 left-0 h-full w-[420px] bg-white shadow-2xl z-50 p-8 flex flex-col border-r border-violet-100">
      <h2 className="text-2xl font-black mb-6 text-violet-900 uppercase tracking-tighter">Checkout</h2>

      {/* Terminal UI */}
      {readerStatus && (
        <div className={`mb-6 p-4 rounded-2xl border-2 transition-all ${
          readerStatus === 'approved' ? 'bg-green-50 border-green-200' : 'bg-violet-50 border-violet-200'
        }`}>
          <p className="font-black text-[10px] uppercase tracking-widest text-violet-400 mb-1">Terminal Status</p>
          <p className={`text-sm font-black uppercase ${readerStatus === 'approved' ? 'text-green-600' : 'text-violet-600'}`}>
            {readerStatus === "waiting" && "Waiting for customer…"}
            {readerStatus === "collecting" && "Tap / Insert Card…"}
            {readerStatus === "approved" && "✔ Payment Approved"}
          </p>
        </div>
      )}

      {/* Payment Selection */}
      <div className="mb-8">
        <label className="block text-[10px] font-black text-violet-400 mb-3 uppercase tracking-widest text-center">Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          {["cash", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => setPaymentType(type as any)}
              className={`py-4 rounded-2xl text-xs font-black uppercase border-2 transition-all ${
                paymentType === type 
                ? "bg-violet-600 text-white border-violet-600 shadow-lg" 
                : "bg-white text-violet-400 border-violet-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Section */}
      {paymentType === "cash" && (
        <div className="mb-8 p-6 bg-violet-50 rounded-[2rem] border-2 border-violet-100">
          <label className="block mb-3 text-xs font-black text-violet-900 uppercase tracking-widest">Amount Tendered</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-violet-400 font-black text-xl">$</span>
            <input
              type="number"
              autoFocus
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="pl-10 pr-4 py-4 w-full bg-white border-2 border-violet-200 rounded-xl text-2xl font-black text-violet-600 outline-none"
              placeholder="0.00"
            />
          </div>
          {changeDue > 0 && (
            <div className="mt-4 pt-4 border-t border-violet-200 flex justify-between items-center">
              <span className="text-xs font-black text-violet-400 uppercase">Change Due:</span>
              <span className="text-2xl font-black text-green-600">${changeDue.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Card Section */}
      {(paymentType === "credit" || paymentType === "debit") && (
        <div className="mb-8 space-y-4">
          <div className="flex bg-violet-50 p-1.5 rounded-2xl border-2 border-violet-100">
            <button onClick={() => setCardEntryMethod("manual")} className={`flex-1 py-2 text-xs font-black rounded-xl ${cardEntryMethod === "manual" ? "bg-white shadow-md text-violet-600" : "text-violet-400"}`}>MANUAL</button>
            <button onClick={() => setCardEntryMethod("terminal")} className={`flex-1 py-2 text-xs font-black rounded-xl ${cardEntryMethod === "terminal" ? "bg-white shadow-md text-violet-600" : "text-violet-400"}`}>READER</button>
          </div>
          {cardEntryMethod === "manual" ? (
            <div className="p-4 border-2 rounded-2xl border-violet-100 bg-white">
              <CardElement options={{ style: { base: { fontSize: '18px', fontWeight: '700' } } }} />
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-[2rem] text-center bg-violet-50 border-violet-200">
              <p className="text-violet-600 font-black uppercase text-xs animate-pulse">Follow Instructions on Reader</p>
            </div>
          )}
        </div>
      )}

      {/* Final Action */}
      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end mb-4 px-2">
            <span className="text-xs font-black text-violet-400 uppercase">Total Due</span>
            <span className="text-4xl font-black text-violet-900">${total.toFixed(2)}</span>
        </div>
        
        {cardEntryMethod !== "terminal" && (
          <button
            onClick={() => paymentType === 'cash' ? handleCashPayment() : handleManualCardPayment()}
            disabled={loading || (paymentType === 'cash' && !cashTendered)}
            className="w-full py-6 bg-violet-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-violet-700 shadow-xl uppercase tracking-widest"
          >
            {loading ? "Processing..." : "Complete Order"}
          </button>
        )}
        <button onClick={onClose} className="w-full py-2 text-violet-300 font-black uppercase text-[10px] tracking-widest hover:text-red-400">Cancel Transaction</button>
      </div>
    </div>
  );
}