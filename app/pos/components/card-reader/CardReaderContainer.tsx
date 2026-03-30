"use client";

/* -------------------------------------------------------
   📦 React + Hooks
------------------------------------------------------- */
import { useState, useEffect } from "react";
import { useCart } from "@/app/pos/hooks/useCart";
import { calculateTotals } from "@/app/pos/lib/calcTotals";

/* -------------------------------------------------------
   🖥️ Reader UI Screens
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

export default function CardReaderContainer({ terminal }: { terminal: any }) {
  const { order } = useCart();
  const totals = calculateTotals(order);
  const { customer, setCustomer } = useCustomer();

  const [screen, setScreen] = useState<
    | "rewards"
    | "quickSignup"
    | "orderSummary"
    | "processing"
    | "approved"
    | "receiptOptions"
    | "thankYou"
  >("rewards");

  const [lookupValue, setLookupValue] = useState("");
  const [paymentEnabled, setPaymentEnabled] = useState(false);

  function broadcastReaderStatus(status: string) {
    window.dispatchEvent(
      new CustomEvent("reader-status-update", { detail: { status } })
    );
  }

  /* -------------------------------------------------------
     🧩 LISTEN: Force Thank You (For Cash or Guest Card)
     Ensures constant dependency array size to prevent crash.
  ------------------------------------------------------- */
  useEffect(() => {
    function handleForceThankYou() {
      setScreen("thankYou");
      
      setTimeout(() => {
        terminal.reset();
        setPaymentEnabled(false);
        broadcastReaderStatus("idle");
        setScreen("rewards");
      }, 3000);
    }

    window.addEventListener("reader-show-thank-you", handleForceThankYou);
    return () => window.removeEventListener("reader-show-thank-you", handleForceThankYou);
  }, []); // Empty array is safest for event listeners during dev

  useEffect(() => {
    function handleCheckout() {
      if (order.length === 0) return;
      setScreen("orderSummary");
      broadcastReaderStatus("connected");
      broadcastReaderStatus("waiting");
    }
    window.addEventListener("cashier-checkout-ready", handleCheckout);
    return () => window.removeEventListener("cashier-checkout-ready", handleCheckout);
  }, [order]);

  useEffect(() => {
    function handlePaymentEnabled() {
      setPaymentEnabled(true);
    }
    window.addEventListener("cashier-payment-enabled", handlePaymentEnabled);
    return () => window.removeEventListener("cashier-payment-enabled", handlePaymentEnabled);
  }, []);

  useEffect(() => {
    function handleCancel() {
      terminal.reset();
      setPaymentEnabled(false);
      setScreen("rewards");
      broadcastReaderStatus("idle");
    }
    window.addEventListener("cashier-cancel-checkout", handleCancel);
    return () => window.removeEventListener("cashier-cancel-checkout", handleCancel);
  }, []);

  useEffect(() => {
    function handleReceiptDone() {
      terminal.reset();
      setPaymentEnabled(false);
      setScreen("rewards");
      broadcastReaderStatus("idle");
    }
    window.addEventListener("cashier-receipt-done", handleReceiptDone);
    return () => window.removeEventListener("cashier-receipt-done", handleReceiptDone);
  }, []);

  const simulatePayment = () => {
    if (!paymentEnabled) return;
    if (terminal.status === "disconnected") terminal.connect();

    broadcastReaderStatus("collecting");
    setScreen("processing");
    broadcastReaderStatus("processing");

    terminal.collectPayment(Math.round(totals.total * 100), () => {
      broadcastReaderStatus("approved");

      window.dispatchEvent(
        new CustomEvent("reader-payment-complete", {
          detail: { paymentType: "credit", cardEntryMethod: "terminal" },
        })
      );

      setScreen("approved");

      setTimeout(() => {
        if (customer) {
          setScreen("receiptOptions");
        } else {
          // Guest flow: Go straight to Thank You
          window.dispatchEvent(
            new CustomEvent("reader-receipt-choice", { detail: { method: "print" } })
          );
          setScreen("thankYou");
          
          setTimeout(() => {
            terminal.reset();
            setPaymentEnabled(false);
            broadcastReaderStatus("idle");
            setScreen("rewards");
          }, 3000);
        }
      }, 1200);
    });
  };

  return (
    <div className="border rounded-lg bg-gray-50 shadow-inner p-4 h-[500px] flex flex-col justify-between text-gray-700">
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

      {screen === "orderSummary" && (
        <div className="flex flex-col h-full w-full text-left">
          <button onClick={() => setScreen("rewards")} className="text-sm text-blue-600 underline mb-2">
            Back
          </button>
          <div className="flex-1 overflow-auto pr-1">
            <ReaderOrderSummaryScreen order={order} totals={totals} customerName={customer?.name ?? null} />
          </div>
          <div className="mt-4 border-t pt-4">
            <button
              onClick={simulatePayment}
              disabled={!paymentEnabled}
              className={`w-full px-4 py-2 rounded text-white font-bold transition-all active:scale-[0.98] ${
                paymentEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              (Simulate) Tap / Insert / Swipe
            </button>
          </div>
        </div>
      )}

      {screen === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-xl font-medium animate-pulse">Processing…</p>
        </div>
      )}

      {screen === "approved" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-4xl font-black text-green-600 uppercase">Approved</p>
        </div>
      )}

      {screen === "receiptOptions" && (
        <ReaderReceiptOptionsScreen
          customerExists={!!customer}
          onDone={(method) => {
            window.dispatchEvent(new CustomEvent("reader-receipt-choice", { detail: { method } }));
            setScreen("thankYou");
            setTimeout(() => {
              terminal.reset();
              setPaymentEnabled(false);
              broadcastReaderStatus("idle");
              setScreen("rewards");
            }, 3000);
          }}
          onTimeout={() => {
            window.dispatchEvent(new CustomEvent("reader-receipt-choice", { detail: { method: "none" } }));
            setScreen("thankYou");
            setTimeout(() => {
              terminal.reset();
              setPaymentEnabled(false);
              broadcastReaderStatus("idle");
              setScreen("rewards");
            }, 3000);
          }}
        />
      )}

      {screen === "thankYou" && (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-6">
          <p className="text-5xl font-black text-green-600 italic tracking-tighter">THANK YOU!</p>
          <p className="text-gray-500 text-lg">
            We appreciate your business!<br /> Have a wonderful day.
          </p>
        </div>
      )}
    </div>
  );
}