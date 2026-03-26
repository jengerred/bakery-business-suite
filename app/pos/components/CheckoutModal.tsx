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
   Handles connect → wait → collect → succeed/fail
------------------------------------------------------- */
import { useTerminalSimulation } from "../hooks/useTerminalSimulation";

/* -------------------------------------------------------
   🧾 Props
   CheckoutModal handles:
   - Cash payments
   - Manual card entry (Stripe Elements)
   - Simulated terminal card entry
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
   🧱 CheckoutModal
------------------------------------------------------- */
export default function CheckoutModal({
  order,
  terminal,
  onClose,
  onComplete,
}: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();

  /* ------------------------------
     🧾 Payment State
  ------------------------------ */
  const [paymentType, setPaymentType] =
    useState<"cash" | "credit" | "debit">("cash");

  const [cardEntryMethod, setCardEntryMethod] =
    useState<"manual" | "terminal">("manual");

  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------------------
     🧮 Totals
  ------------------------------ */
  const subtotal = order.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const changeDue =
    Number(cashTendered) > 0 ? Number(cashTendered) - total : 0;

  /* ------------------------------
     🔄 Reset terminal on unmount
  ------------------------------ */
  useEffect(() => {
    return () => {
      terminal.reset();
    };
  }, []);

  /* -------------------------------------------------------
     ✅ HANDLE COMPLETE (cash or manual card)
     Terminal card flow handled separately inside UI block.
  ------------------------------------------------------- */
  async function handleComplete() {
    /* -------------------------
       💳 CARD PAYMENT (manual)
    ------------------------- */
    if (paymentType === "credit" || paymentType === "debit") {
      if (cardEntryMethod === "terminal") return; // handled elsewhere

      if (!stripe || !elements) return;
      setLoading(true);

      // Create PaymentIntent
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

      // Confirm card payment
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
        }, 600);
      }

      return;
    }

    /* -------------------------
       💵 CASH PAYMENT
    ------------------------- */
    onComplete({
      paymentType: "cash",
      cashTendered: Number(cashTendered),
      changeGiven: changeDue,
    });
  }

  /* -------------------------------------------------------
     🎨 RENDER
  ------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[420px]">
        <h2 className="text-xl font-semibold mb-4">Checkout</h2>

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
                <span className="font-semibold">
                  ${changeDue.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* -------------------------------------------------------
           💳 CARD MODE (credit/debit)
        ------------------------------------------------------- */}
        {(paymentType === "credit" || paymentType === "debit") && (
          <div className="mb-4 space-y-3">

            {/* ------------------------------
               Manual vs Terminal buttons
            ------------------------------ */}
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
                  if (terminal.status === "disconnected") terminal.connect();
                }}
                className={`px-3 py-1 rounded border ${
                  cardEntryMethod === "terminal"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Reader (Simulated)
              </button>
            </div>

            {/* ------------------------------
               Manual Entry (Stripe Elements)
            ------------------------------ */}
            {cardEntryMethod === "manual" && (
              <div>
                <label className="block mb-1 font-medium">Card Details</label>
                <div className="border rounded p-2">
                  <CardElement />
                </div>
              </div>
            )}

            {/* ------------------------------
               Terminal Simulation
            ------------------------------ */}
            {cardEntryMethod === "terminal" && (
              <div className="border rounded p-3 text-sm space-y-2">
                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Simulated Reader</span>
                  <span
                    className={
                      terminal.status === "connected" ||
                      terminal.status === "waiting" ||
                      terminal.status === "collecting"
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {terminal.status === "disconnected" && "Disconnected"}
                    {terminal.status === "connecting" && "Connecting..."}
                    {terminal.status === "connected" && "Reader Connected"}
                    {terminal.status === "waiting" && "Waiting for customer..."}
                    {terminal.status === "collecting" && "Collecting payment..."}
                    {terminal.status === "failed" && "Error"}
                  </span>
                </div>

                {/* Error */}
                {terminal.error && (
                  <p className="text-red-600 text-xs">{terminal.error}</p>
                )}

                <p className="text-gray-700">
                  Ask customer to tap, insert, or swipe card on the reader.
                </p>

                {/* Simulate payment */}
                <button
                  type="button"
                  disabled={
                    terminal.status === "connecting" ||
                    terminal.status === "collecting"
                  }
                  onClick={() =>
                    terminal.collectPayment(
                      Math.round(total * 100),
                      (piId) => {
                        toast.success("Payment successful!");

                        setTimeout(() => {
                          onComplete({
                            paymentType,
                            cardEntryMethod: "terminal",
                            stripePaymentId: piId,
                          });
                        }, 600);
                      }
                    )
                  }
                  className={`w-full px-3 py-2 rounded text-white text-sm ${
                    terminal.status === "connecting" ||
                    terminal.status === "collecting"
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Simulate Tap / Insert / Swipe
                </button>
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
    </div>
  );
}
