"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState, useEffect } from "react";

/* -------------------------------------------------------
   🧺 Product Type
------------------------------------------------------- */
import { Product } from "../lib/products";

/* -------------------------------------------------------
   💳 Stripe (manual card entry)
------------------------------------------------------- */
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

/* -------------------------------------------------------
   🔔 Toast Notifications
------------------------------------------------------- */
import { toast } from "react-hot-toast";

/* -------------------------------------------------------
   🧪 Simulated Terminal Hook
------------------------------------------------------- */
import { useTerminalSimulation } from "../hooks/useTerminalSimulation";

/* -------------------------------------------------------
   🧾 Props
------------------------------------------------------- */
type CheckoutModalProps = {
  order: { product: Product; quantity: number }[];
  terminal: ReturnType<typeof useTerminalSimulation>;
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
   🧱 CheckoutModal (SIDE PANEL VERSION)
   Handles:
   - Cash payments
   - Manual card entry (Stripe Elements)
   - Terminal-simulated card entry
   - Reader status events
   - PaymentIntent creation
   - Reset behavior
------------------------------------------------------- */
export default function CheckoutModal({
  order,
  terminal,
  onClose,
  onComplete,
}: CheckoutModalProps) {

  const stripe = useStripe();
  const elements = useElements();

  /* -------------------------------------------------------
     🧾 Payment State
  ------------------------------------------------------- */
  const [paymentType, setPaymentType] =
    useState<"cash" | "credit" | "debit">("cash");

  const [cardEntryMethod, setCardEntryMethod] =
    useState<"manual" | "terminal">("manual");

  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     ⭐ Cashier-Side Reader Status
     NOTE: These are UI states, not terminal states.
  ------------------------------------------------------- */
  type CashierReaderStatus =
    | "connected"
    | "waiting"
    | "collecting"
    | "processing"
    | "approved"
    | null;

  const [readerStatus, setReaderStatus] = useState<CashierReaderStatus>(null);

  /* -------------------------------------------------------
     🧮 Totals
  ------------------------------------------------------- */
  const subtotal = order.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const changeDue =
    Number(cashTendered) > 0 ? Number(cashTendered) - total : 0;

  /* -------------------------------------------------------
     🔄 Reset terminal on unmount
  ------------------------------------------------------- */
  useEffect(() => {
    return () => {
      terminal.reset();
    };
  }, []);

  /* -------------------------------------------------------
     ⭐ EVENT CONTRACT (Cashier ↔ Reader)
     - reader-status-update: { status }
     - reader-payment-started
     - reader-payment-complete: { paymentType, cardEntryMethod }
     - cashier-receipt-done (cash/manual card)
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReaderStatus(e: any) {
      setReaderStatus(e.detail.status);
    }

    function handleReaderStarted() {
      setReaderStatus("collecting");
    }

    function handleReaderComplete(e: any) {
      const { paymentType, cardEntryMethod } = e.detail;

      // Show "Approved" briefly before completing checkout
      setTimeout(() => {
        setReaderStatus("approved");

        setTimeout(() => {
          onComplete({ paymentType, cardEntryMethod });
        }, 900);
      }, 700);
    }

    window.addEventListener("reader-status-update", handleReaderStatus);
    window.addEventListener("reader-payment-started", handleReaderStarted);
    window.addEventListener("reader-payment-complete", handleReaderComplete);

    return () => {
      window.removeEventListener("reader-status-update", handleReaderStatus);
      window.removeEventListener("reader-payment-started", handleReaderStarted);
      window.removeEventListener("reader-payment-complete", handleReaderComplete);
    };
  }, []);

  /* -------------------------------------------------------
     ⭐ HELPERS — Manual Card + Cash
     (Terminal card is handled by reader events)
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
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
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

        // Reset reader for manual card
        window.dispatchEvent(new CustomEvent("cashier-receipt-done"));
      }, 600);
    }
  }

  function handleCashPayment() {
    onComplete({
      paymentType: "cash",
      cashTendered: Number(cashTendered),
      changeGiven: changeDue,
    });

    // Reset reader for cash
    window.dispatchEvent(new CustomEvent("cashier-receipt-done"));
  }

  /* -------------------------------------------------------
     ⭐ HANDLE COMPLETE (cash or manual card)
     Terminal card is handled by reader events.
  ------------------------------------------------------- */
  async function handleComplete() {
    if (paymentType === "credit" || paymentType === "debit") {
      if (cardEntryMethod === "terminal") return;
      return handleManualCardPayment();
    }

    return handleCashPayment();
  }

  /* -------------------------------------------------------
     🎨 RENDER — SIDE PANEL
  ------------------------------------------------------- */
  return (
    <div className="fixed top-0 left-0 h-full w-[420px] bg-white shadow-2xl z-50 p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>

      {/* -------------------------------------------------------
         ⭐ READER STATUS DISPLAY
      ------------------------------------------------------- */}
      {readerStatus && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p className="font-medium text-gray-700">Card Reader Status</p>

          {readerStatus === "connected" && (
            <p className="text-sm text-green-600">Reader Connected</p>
          )}
          {readerStatus === "waiting" && (
            <p className="text-sm text-blue-600">Waiting for customer…</p>
          )}
          {readerStatus === "collecting" && (
            <p className="text-sm text-blue-600">Collecting payment…</p>
          )}
          {readerStatus === "processing" && (
            <p className="text-sm text-blue-600">Processing…</p>
          )}
          {readerStatus === "approved" && (
            <p className="text-sm text-green-600">Payment Approved!</p>
          )}
        </div>
      )}

      {/* -------------------------------------------------------
         💳 PAYMENT TYPE SELECTOR
      ------------------------------------------------------- */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Payment Type</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as any)}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="cash">Cash</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
        </select>
      </div>

      {/* -------------------------------------------------------
         💵 CASH MODE
      ------------------------------------------------------- */}
      {paymentType === "cash" && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Cash Tendered</label>
          <input
            type="number"
            value={cashTendered}
            onChange={(e) => setCashTendered(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          {cashTendered && (
            <p className="mt-2 text-sm">
              Change Due:{" "}
              <span className="font-semibold">${changeDue.toFixed(2)}</span>
            </p>
          )}
        </div>
      )}

      {/* -------------------------------------------------------
         💳 CARD MODE (credit/debit)
      ------------------------------------------------------- */}
      {(paymentType === "credit" || paymentType === "debit") && (
        <div className="mb-4 space-y-3">

          {/* Manual vs Terminal */}
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setCardEntryMethod("manual")}
              className={`px-3 py-1 rounded border ${
                cardEntryMethod === "manual"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Manual Entry
            </button>

            <button
              type="button"
              onClick={() => {
                setCardEntryMethod("terminal");
                setReaderStatus("waiting");
                if (terminal.status === "disconnected") terminal.connect();
              }}
              className={`px-3 py-1 rounded border ${
                cardEntryMethod === "terminal"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Reader (Customer)
            </button>
          </div>

          {/* Manual Entry */}
          {cardEntryMethod === "manual" && (
            <div>
              <label className="block mb-1 font-medium">Card Details</label>
              <div className="border rounded p-2">
                <CardElement />
              </div>
            </div>
          )}

          {/* Terminal Mode */}
          {cardEntryMethod === "terminal" && (
            <div className="border rounded p-3 text-sm space-y-2 text-center">
              <p className="text-gray-700">
                Please complete the payment on the customer-facing reader.
              </p>

              <p
                className={`text-xs ${
                  terminal.status === "connected" ||
                  terminal.status === "waiting" ||
                  terminal.status === "collecting"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {terminal.status === "disconnected" && "Reader Disconnected"}
                {terminal.status === "connecting" && "Connecting…"}
                {terminal.status === "connected" && "Reader Connected"}
                {terminal.status === "waiting" && "Waiting for customer…"}
                {terminal.status === "collecting" && "Collecting payment…"}
                {terminal.status === "failed" && "Reader Error"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------
         🧭 ACTION BUTTONS
      ------------------------------------------------------- */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Processing..." : "Complete Order"}
        </button>
      </div>
    </div>
  );
}
