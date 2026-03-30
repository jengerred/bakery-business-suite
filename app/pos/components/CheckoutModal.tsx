"use client";

/* -------------------------------------------------------
   📦 React + Hooks
------------------------------------------------------- */
import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";

/* -------------------------------------------------------
   🧱 UI Components & Types
------------------------------------------------------- */
import { Product } from "../lib/products";
import { useTerminalSimulation } from "../hooks/useTerminalSimulation";

type CheckoutModalProps = {
  order: { product: Product; quantity: number }[];
  terminal: ReturnType<typeof useTerminalSimulation>;
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

/* -------------------------------------------------------
   🧱 CheckoutModal
   The cashier's payment processing interface.
   
   Responsibilities:
   - Handle payment method selection (Cash vs. Card).
   - Sync with physical/simulated reader hardware via events.
   - Process manual card entries via Stripe.
   - Auto-calculate totals and change for cash transactions.
------------------------------------------------------- */
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
     📝 Internal State
  ------------------------------------------------------- */
  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "debit">("cash");
  const [cardEntryMethod, setCardEntryMethod] = useState<"manual" | "terminal">("manual");
  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);

  // Status for the cashier's hardware monitoring ribbon
  type CashierReaderStatus = "connected" | "waiting" | "collecting" | "processing" | "approved" | null;
  const [readerStatus, setReaderStatus] = useState<CashierReaderStatus>(null);

  /* -------------------------------------------------------
     🧮 Totals Calculation
  ------------------------------------------------------- */
  const subtotal = order.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;
  const changeDue = Number(cashTendered) > 0 ? Number(cashTendered) - total : 0;

  /* -------------------------------------------------------
     🎯 Auto-Select Logic (Reader Sync)
     When the customer continues past the rewards screen on the 
     reader, the Cashier UI automatically flips to Card mode.
  ------------------------------------------------------- */
  useEffect(() => {
    if (forceReaderMode) {
      setPaymentType("credit");
      setCardEntryMethod("terminal");
    }
  }, [forceReaderMode]);

  /* -------------------------------------------------------
     📡 Hardware Event Listeners
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReaderStatus(e: any) { 
      const status = e.detail.status;
      setReaderStatus(status);

      // Trigger cashier UI tab flip based on hardware signal
      if (status === "collecting" || status === "processing") {
        setPaymentType("credit");
        setCardEntryMethod("terminal");
      }
    }
    
    function handleReaderStarted() { 
      setPaymentType("credit");
      setCardEntryMethod("terminal");
      setReaderStatus("collecting");
    }

    function handleReaderComplete(e: any) {
      const { paymentType: pType, cardEntryMethod: cMethod } = e.detail;
      // Show approved state briefly before finalizing
      setReaderStatus("approved");
      setTimeout(() => {
        onComplete({ paymentType: pType, cardEntryMethod: cMethod });
      }, 1200);
    }

    window.addEventListener("reader-status-update", handleReaderStatus);
    window.addEventListener("reader-payment-started", handleReaderStarted);
    window.addEventListener("reader-payment-complete", handleReaderComplete);

    return () => {
      window.removeEventListener("reader-status-update", handleReaderStatus);
      window.removeEventListener("reader-payment-started", handleReaderStarted);
      window.removeEventListener("reader-payment-complete", handleReaderComplete);
      terminal.reset();
    };
  }, [onComplete, terminal]);

  /* -------------------------------------------------------
     💳 Payment Processing Logic
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
      alert("Payment error: " + error);
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    setLoading(false);
    if (result.error) {
      alert(result.error.message);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      toast.success("Payment successful!");
      setTimeout(() => {
        onComplete({
          paymentType,
          cardEntryMethod: "manual",
          stripePaymentId: result.paymentIntent.id,
        });
        window.dispatchEvent(new CustomEvent("reader-show-thank-you"));
      }, 600);
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

  async function handleComplete() {
    if (paymentType === "credit" || paymentType === "debit") {
      if (cardEntryMethod === "terminal") return; // Reader handles its own completion
      return handleManualCardPayment();
    }
    return handleCashPayment();
  }

  /* -------------------------------------------------------
     🎨 UI Render
  ------------------------------------------------------- */
  return (
    <div className="fixed top-0 left-0 h-full w-[420px] bg-white shadow-2xl z-50 p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 uppercase tracking-tight">Checkout</h2>

      {/* 📡 Hardware Status Ribbon */}
      {readerStatus && (
        <div className="mb-4 p-3 border rounded bg-slate-50 border-slate-200 transition-all">
          <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-1">Reader Status</p>
          <p className={`text-sm font-bold ${readerStatus === 'approved' ? 'text-green-600' : 'text-blue-600'}`}>
            {(readerStatus === "waiting" || readerStatus === "connected") && "Waiting for customer…"}
            {readerStatus === "collecting" && "Collecting payment…"}
            {readerStatus === "processing" && "Processing…"}
            {readerStatus === "approved" && "Payment Approved!"}
          </p>
        </div>
      )}

      {/* 📑 Payment Method Selector */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {["cash", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => setPaymentType(type as any)}
              className={`py-2 px-1 border rounded text-sm font-bold capitalize transition-all ${
                paymentType === type 
                ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 💵 Cash Payment View */}
      {paymentType === "cash" && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 animate-in fade-in zoom-in-95">
          <label className="block mb-2 text-xs font-bold text-green-800 uppercase">Cash Tendered</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-green-600 font-bold">$</span>
            <input
              type="number"
              autoFocus
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="pl-7 pr-3 py-2 w-full border border-green-200 rounded text-lg font-mono outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {/* 💳 Card Payment View */}
      {(paymentType === "credit" || paymentType === "debit") && (
        <div className="mb-6 space-y-4 animate-in fade-in zoom-in-95">
          {/* Entry Method Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setCardEntryMethod("manual")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                cardEntryMethod === "manual" ? "bg-white shadow text-slate-800" : "text-slate-500"
              }`}
            >
              MANUAL
            </button>
            <button
              onClick={() => setCardEntryMethod("terminal")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                cardEntryMethod === "terminal" ? "bg-white shadow text-slate-800" : "text-slate-500"
              }`}
            >
              READER
            </button>
          </div>

          {cardEntryMethod === "manual" ? (
            <div className="p-3 border rounded-lg border-slate-200 bg-white">
              <label className="block mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Details</label>
              <CardElement />
            </div>
          ) : (
            <div className={`p-6 border-2 border-dashed rounded-xl text-center transition-colors duration-500 ${
              readerStatus === 'approved' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm font-medium mb-1 italic ${
                readerStatus === 'approved' ? 'text-green-800' : 'text-blue-800'
              }`}>
                Customer Interaction Required
              </p>
              <p className={`text-xs uppercase font-black tracking-widest ${
                readerStatus === 'approved' ? 'text-green-600' : 'text-blue-600 animate-pulse'
              }`}>
                {(readerStatus === "waiting" || readerStatus === "connected" || !readerStatus) && "Waiting for tap..."}
                {(readerStatus === "collecting" || readerStatus === "processing") && "Processing payment..."}
                {readerStatus === "approved" && "Payment Approved!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔘 Footer Actions */}
      <div className="mt-auto space-y-3">
        {/* Only show "Complete" button for non-automated payment methods */}
        {cardEntryMethod !== "terminal" && (
          <button
            onClick={handleComplete}
            disabled={loading || (paymentType === 'cash' && !cashTendered)}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-lg hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg uppercase"
          >
            {loading ? "Processing..." : "Complete Order"}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest text-center hover:text-slate-600"
        >
          Cancel Transaction
        </button>
      </div>
    </div>
  );
}