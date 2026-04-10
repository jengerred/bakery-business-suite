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
  /** The current items in the cart, including specialized bulk pricing */
  order: { product: Product; quantity: number; overridePrice?: number }[];
  /** State and controls for the simulated card reader hardware */
  terminal: ReturnType<typeof useTerminalSimulation>;
  /** If true, the UI skips method selection and forces Terminal mode */
  forceReaderMode?: boolean;
  onClose: () => void;
  onComplete: (data: {
    paymentType: "cash" | "credit" | "debit";
    cardEntryMethod?: "manual" | "terminal";
    cashTendered?: number;
    changeGiven?: number;
    stripePaymentId?: string;
  }) => void;
};

/**
 * CheckoutModal
 * Side-panel interface for processing final payments.
 * Handles Cash, Manual Card Entry (Stripe), and Physical Terminal Sync.
 */
export default function CheckoutModal({
  order,
  terminal,
  forceReaderMode = false,
  onClose,
  onComplete,
}: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();

  /* -------------------------------------------------------
     📝 Payment Logic State
  ------------------------------------------------------- */
  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "debit">("cash");
  const [cardEntryMethod, setCardEntryMethod] = useState<"manual" | "terminal">("manual");
  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [readerStatus, setReaderStatus] = useState<string | null>(null);

  /* -------------------------------------------------------
     🧮 Dynamic Totals Calculation (Fixed Tax Logic)
     Calculates tax ONLY on items marked as taxable: true.
  ------------------------------------------------------- */
  
  // 1. Calculate overall subtotal
  const subtotal = order.reduce((sum, item) => {
    const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
    return sum + (activePrice * item.quantity);
  }, 0);

  // 2. Calculate subtotal for taxable items only
  const taxableSubtotal = order.reduce((sum, item) => {
    if (item.product.taxable) {
      const activePrice = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
      return sum + (activePrice * item.quantity);
    }
    return sum;
  }, 0);

  const tax = taxableSubtotal * 0.06; // Michigan Sales Tax applied correctly
  const total = subtotal + tax;
  const changeDue = Number(cashTendered) > 0 ? Number(cashTendered) - total : 0;

  /* -------------------------------------------------------
     📡 Hardware Event Listeners
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
          paymentType: e.detail.paymentType, 
          cardEntryMethod: e.detail.cardEntryMethod 
        });
      }, 1200);
    }

    window.addEventListener("reader-status-update", handleReaderStatus);
    window.addEventListener("reader-payment-complete", handleReaderComplete);

    return () => {
      window.removeEventListener("reader-status-update", handleReaderStatus);
      window.removeEventListener("reader-payment-complete", handleReaderComplete);
    };
  }, [onComplete]);

  /* -------------------------------------------------------
     💳 Manual Payment Handlers
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
        paymentType,
        cardEntryMethod: "manual",
        stripePaymentId: result.paymentIntent.id,
      });
    }
  }

  function handleCashPayment() {
    onComplete({
      paymentType: "cash",
      cashTendered: Number(cashTendered),
      changeGiven: changeDue,
    });
    window.dispatchEvent(new CustomEvent("reader-show-thank-you"));
  }

  /* -------------------------------------------------------
     🎨 UI Render
  ------------------------------------------------------- */
  return (
    <div className="fixed top-0 left-0 h-full w-[420px] bg-white shadow-2xl z-50 p-8 flex flex-col border-r border-violet-100">
      <h2 className="text-2xl font-black mb-6 text-violet-900 uppercase tracking-tighter">Checkout</h2>

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

      <div className="mb-8">
        <label className="block text-[10px] font-black text-violet-400 mb-3 uppercase tracking-widest text-center">Select Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          {["cash", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => setPaymentType(type as any)}
              className={`py-4 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                paymentType === type 
                ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/30" 
                : "bg-white text-violet-400 border-violet-100 hover:border-violet-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {paymentType === "cash" && (
        <div className="mb-8 p-6 bg-violet-50 rounded-[2rem] border-2 border-violet-100 animate-in slide-in-from-bottom-4 duration-300">
          <label className="block mb-3 text-xs font-black text-violet-900 uppercase tracking-widest">Amount Tendered</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-violet-400 font-black text-xl">$</span>
            <input
              type="number"
              autoFocus
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="pl-10 pr-4 py-4 w-full bg-white border-2 border-violet-200 rounded-xl text-2xl font-black text-violet-600 outline-none focus:border-violet-500 transition-all"
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

      {(paymentType === "credit" || paymentType === "debit") && (
        <div className="mb-8 space-y-4">
          <div className="flex bg-violet-50 p-1.5 rounded-2xl border-2 border-violet-100">
            <button
              onClick={() => setCardEntryMethod("manual")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                cardEntryMethod === "manual" ? "bg-white shadow-md text-violet-600" : "text-violet-400"
              }`}
            >
              MANUAL
            </button>
            <button
              onClick={() => setCardEntryMethod("terminal")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                cardEntryMethod === "terminal" ? "bg-white shadow-md text-violet-600" : "text-violet-400"
              }`}
            >
              READER
            </button>
          </div>

          {cardEntryMethod === "manual" ? (
            <div className="p-4 border-2 rounded-2xl border-violet-100 bg-white">
              <CardElement options={{ style: { base: { fontSize: '18px', fontWeight: '700' } } }} />
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-[2rem] text-center bg-violet-50 border-violet-200">
              <p className="text-violet-600 font-black uppercase text-xs tracking-tighter animate-pulse">
                Follow instructions on Reader
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end mb-4 px-2">
            <span className="text-xs font-black text-violet-400 uppercase">Total Due</span>
            <span className="text-4xl font-black text-violet-900">${total.toFixed(2)}</span>
        </div>
        
        {cardEntryMethod !== "terminal" && (
          <button
            onClick={() => paymentType === 'cash' ? handleCashPayment() : handleManualCardPayment()}
            disabled={loading || (paymentType === 'cash' && !cashTendered)}
            className="w-full py-6 bg-violet-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-violet-700 transition-all active:scale-95 shadow-xl shadow-violet-600/30 uppercase tracking-widest"
          >
            {loading ? "Processing..." : "Complete Order"}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-2 text-violet-300 font-black uppercase text-[10px] tracking-widest hover:text-red-400 transition-colors"
        >
          Cancel Transaction
        </button>
      </div>
    </div>
  );
}