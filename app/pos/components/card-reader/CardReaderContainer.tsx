"use client";

/* -------------------------------------------------------
   📦 React + Hooks
------------------------------------------------------- */
import { useState, useEffect } from "react";
import { useCart } from "@/app/pos/hooks/useCart";
import { calculateTotals } from "@/app/pos/lib/calcTotals";

/* -------------------------------------------------------
   🖥️ Reader UI Screens
   These are the customer-facing screens shown on the
   simulated card reader device.
------------------------------------------------------- */
import ReaderRewardsScreen from "./ReaderRewardsScreen";
import ReaderQuickSignupScreen from "./ReaderQuickSignupScreen";
import ReaderOrderSummaryScreen from "./ReaderOrderSummaryScreen";
import ReaderReceiptOptionsScreen from "./ReaderReceiptOptionsScreen";

/* -------------------------------------------------------
   👤 Customer Context + Services
------------------------------------------------------- */
import { useCustomer } from "@/app/pos/context/CustomerContext";
import { userService } from "@/app/pos/lib/userService";

/* -------------------------------------------------------
   🧱 CardReaderContainer
   The entire customer-facing reader UI.

   This component:
   - Listens for cashier events (checkout, cancel, payment enabled)
   - Manages the reader's screen state machine
   - Simulates payment collection
   - Handles receipt options + thank-you flow
   - Resets itself after each completed sale
------------------------------------------------------- */
export default function CardReaderContainer({ terminal }: { terminal: any }) {
  /* -------------------------------------------------------
     🛒 Order + Totals
  ------------------------------------------------------- */
  const { order } = useCart();
  const totals = calculateTotals(order);

  /* -------------------------------------------------------
     👤 Customer (from global context)
  ------------------------------------------------------- */
  const { customer, setCustomer } = useCustomer();

  /* -------------------------------------------------------
     📺 Reader Screen State Machine
     Controls which screen the customer sees.
  ------------------------------------------------------- */
  const [screen, setScreen] = useState<
    | "rewards"
    | "quickSignup"
    | "orderSummary"
    | "processing"
    | "approved"
    | "receiptOptions"
    | "printOnly"
    | "thankYou"
  >("rewards");

  /* -------------------------------------------------------
     🔍 Rewards Lookup Value
  ------------------------------------------------------- */
  const [lookupValue, setLookupValue] = useState("");

  /* -------------------------------------------------------
     💳 Payment Enabled Flag
     Cashier triggers this when ready for customer to pay.
  ------------------------------------------------------- */
  const [paymentEnabled, setPaymentEnabled] = useState(false);

  /* -------------------------------------------------------
     📡 Broadcast Reader Status to Cashier UI
     (Used to update the cashier-side status badge)
  ------------------------------------------------------- */
  function broadcastReaderStatus(status: string) {
    window.dispatchEvent(
      new CustomEvent("reader-status-update", { detail: { status } })
    );
  }

  /* -------------------------------------------------------
     🧩 LISTEN: Cashier pressed "Checkout"
     → Reader should show Order Summary
  ------------------------------------------------------- */
  useEffect(() => {
    function handleCheckout() {
      if (order.length === 0) return;

      setScreen("orderSummary");
      broadcastReaderStatus("connected");
      broadcastReaderStatus("waiting");
    }

    window.addEventListener("cashier-checkout-ready", handleCheckout);
    return () =>
      window.removeEventListener("cashier-checkout-ready", handleCheckout);
  }, [order]);

  /* -------------------------------------------------------
     🧩 LISTEN: Cashier enabled payment
     → Reader can now simulate tap/insert/swipe
  ------------------------------------------------------- */
  useEffect(() => {
    function handlePaymentEnabled() {
      setPaymentEnabled(true);
    }

    window.addEventListener("cashier-payment-enabled", handlePaymentEnabled);
    return () =>
      window.removeEventListener("cashier-payment-enabled", handlePaymentEnabled);
  }, []);

  /* -------------------------------------------------------
     🧩 LISTEN: Cashier canceled checkout
     → Reset reader to Rewards screen
  ------------------------------------------------------- */
  useEffect(() => {
    function handleCancel() {
      terminal.reset();
      setPaymentEnabled(false);
      setScreen("rewards");
      broadcastReaderStatus("idle");
    }

    window.addEventListener("cashier-cancel-checkout", handleCancel);
    return () =>
      window.removeEventListener("cashier-cancel-checkout", handleCancel);
  }, []);

  /* -------------------------------------------------------
     🧩 LISTEN: Cashier closed receipt modal
     → Reader should reset to Rewards
     (Used for cash/manual card payments)
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReceiptDone() {
      terminal.reset();
      setPaymentEnabled(false);
      setScreen("rewards");
      broadcastReaderStatus("idle");
    }

    window.addEventListener("cashier-receipt-done", handleReceiptDone);
    return () =>
      window.removeEventListener("cashier-receipt-done", handleReceiptDone);
  }, []);

  /* -------------------------------------------------------
     💳 PAYMENT SIMULATION (Terminal)
     Simulates a real Stripe Terminal flow:
     - collecting → processing → approved
     - then either receipt options or auto-print
  ------------------------------------------------------- */
  const simulatePayment = () => {
    if (!paymentEnabled) return;

    if (terminal.status === "disconnected") terminal.connect();

    broadcastReaderStatus("collecting");
    setScreen("processing");

    broadcastReaderStatus("processing");

    terminal.collectPayment(Math.round(totals.total * 100), () => {
      broadcastReaderStatus("approved");

      // Notify cashier-side CheckoutModal
      window.dispatchEvent(
        new CustomEvent("reader-payment-complete", {
          detail: {
            paymentType: "credit",
            cardEntryMethod: "terminal",
          },
        })
      );

      setScreen("approved");

      // After approval, show receipt options or auto-print
      setTimeout(() => {
        if (customer) {
          setScreen("receiptOptions");
        } else {
          // No customer → auto-print
          window.dispatchEvent(
            new CustomEvent("reader-receipt-choice", {
              detail: { method: "print" },
            })
          );
          setScreen("printOnly");
        }
      }, 1200);
    });
  };

  /* -------------------------------------------------------
     🎨 RENDER — Reader UI
  ------------------------------------------------------- */
  return (
    <div className="border rounded-lg bg-gray-50 shadow-inner p-4 h-[500px] flex flex-col justify-between text-gray-700">

      {/* ⭐ REWARDS SCREEN */}
      {screen === "rewards" && (
        <ReaderRewardsScreen
          onSubmit={async (value) => {
            setLookupValue(value);

            const found = await userService.find(value);

            if (found) {
              setCustomer(found);
              setScreen("orderSummary");
              broadcastReaderStatus("connected");
              broadcastReaderStatus("waiting");
            } else {
              setScreen("quickSignup");
            }
          }}
          onSkip={() => {
            setScreen("orderSummary");
            broadcastReaderStatus("connected");
            broadcastReaderStatus("waiting");
          }}
        />
      )}

      {/* ⭐ QUICK SIGNUP */}
      {screen === "quickSignup" && (
        <ReaderQuickSignupScreen
          initialValue={lookupValue}
          onCreate={async (newUser) => {
            setCustomer(newUser);
            setScreen("orderSummary");
            broadcastReaderStatus("connected");
            broadcastReaderStatus("waiting");
          }}
          onBack={() => setScreen("rewards")}
        />
      )}

      {/* ⭐ ORDER SUMMARY */}
      {screen === "orderSummary" && (
        <div className="flex flex-col h-full w-full">
          <button
            onClick={() => setScreen("rewards")}
            className="text-sm text-blue-600 underline mb-2"
          >
            Back
          </button>

          <div className="flex-1 overflow-auto pr-1">
            <ReaderOrderSummaryScreen
              order={order}
              totals={totals}
              customerName={customer?.name ?? null}
            />
          </div>

          <div className="mt-4 border-t pt-4">
            <button
              onClick={simulatePayment}
              disabled={!paymentEnabled}
              className={`w-full px-4 py-2 rounded text-white ${
                paymentEnabled
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              (Simulate) Tap / Insert / Swipe
            </button>

            <p className="text-center text-xs text-gray-500 mt-2">
              Reader Status: {terminal.status}
            </p>
          </div>
        </div>
      )}

      {/* ⭐ PROCESSING */}
      {screen === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-lg font-medium">Processing…</p>
          <p className="text-gray-500">{terminal.status}</p>
        </div>
      )}

      {/* ⭐ APPROVED */}
      {screen === "approved" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-2xl font-semibold text-green-600">
            Payment Approved
          </p>
        </div>
      )}

      {/* ⭐ RECEIPT OPTIONS */}
      {screen === "receiptOptions" && (
        <ReaderReceiptOptionsScreen
          customerExists={!!customer}
          onDone={(method) => {
            // Notify cashier which receipt method was chosen
            window.dispatchEvent(
              new CustomEvent("reader-receipt-choice", {
                detail: { method },
              })
            );

            // Show Thank You screen
            setScreen("thankYou");

            // Reset reader after short delay
            setTimeout(() => {
              terminal.reset();
              setPaymentEnabled(false);
              broadcastReaderStatus("idle");
              setScreen("rewards");
            }, 2000);
          }}
          onTimeout={() => {
            // No selection → treat as "none"
            window.dispatchEvent(
              new CustomEvent("reader-receipt-choice", {
                detail: { method: "none" },
              })
            );

            setScreen("thankYou");

            setTimeout(() => {
              terminal.reset();
              setPaymentEnabled(false);
              broadcastReaderStatus("idle");
              setScreen("rewards");
            }, 2000);
          }}
        />
      )}

      {/* ⭐ PRINT-ONLY RECEIPT (no customer) */}
      {screen === "printOnly" && (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-lg font-medium">Receipt Printed</p>
          <button
            onClick={() => {
              terminal.reset();
              setPaymentEnabled(false);
              broadcastReaderStatus("idle");
              setScreen("rewards");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Done
          </button>
        </div>
      )}

      {/* ⭐ THANK YOU SCREEN */}
      {screen === "thankYou" && (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-2xl font-semibold text-green-600">Thank you!</p>
          <p className="text-gray-500 text-sm">
            Your receipt is being processed…
          </p>
        </div>
      )}
    </div>
  );
}
