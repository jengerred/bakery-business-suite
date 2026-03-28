"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   📡 Terminal Status Types
   Represents the lifecycle of a simulated card reader.
------------------------------------------------------- */
type TerminalStatus =
  | "disconnected"   // Reader not connected
  | "connecting"     // Attempting to connect
  | "connected"      // Connected but not ready yet
  | "waiting"        // Waiting for customer to tap/insert/swipe
  | "collecting"     // Processing payment
  | "succeeded"      // Payment succeeded
  | "failed";        // Payment failed

/* -------------------------------------------------------
   💳 useTerminalSimulation
   Simulates a Stripe Terminal-like card reader for dev use.

   Responsibilities:
   - Manage connection lifecycle
   - Simulate PaymentIntent creation
   - Simulate card reader processing delays
   - Expose status + error + control functions

   NOTE:
   - This is a DEV-ONLY simulation.
   - Real Stripe Terminal uses hardware + WebUSB/WebBluetooth.
------------------------------------------------------- */
export function useTerminalSimulation() {

  /* -------------------------------------------------------
     🔌 Terminal State
  ------------------------------------------------------- */
  const [status, setStatus] = useState<TerminalStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------
     🔗 connect()
     Simulates connecting to a physical card reader.

     Flow:
       disconnected → connecting → connected → waiting
  ------------------------------------------------------- */
  function connect() {
    setError(null);
    setStatus("connecting");

    // Simulate connection delay
    setTimeout(() => {
      setStatus("connected");

      // After connecting, reader becomes ready for customer
      setTimeout(() => {
        setStatus("waiting");
      }, 300);
    }, 800);
  }

  /* -------------------------------------------------------
     💳 collectPayment()
     Simulates collecting a card payment.

     Steps:
       1. Create PaymentIntent via API
       2. Simulate reader processing delay
       3. Return fake PaymentIntent ID
  ------------------------------------------------------- */
  async function collectPayment(
    amountInCents: number,
    onSuccess: (paymentIntentId: string) => void
  ) {
    try {
      setError(null);
      setStatus("collecting");

      // Create PaymentIntent (Elements flow)
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ amount: amountInCents }),
      });

      const { clientSecret, error } = await res.json();

      if (error || !clientSecret) {
        setStatus("failed");
        setError(error || "Failed to create PaymentIntent");
        return;
      }

      // Simulate card reader processing delay
      setTimeout(() => {
        const fakePaymentIntentId =
          "pi_simulated_" + Math.random().toString(36).slice(2);

        setStatus("succeeded");
        onSuccess(fakePaymentIntentId);
      }, 1500);
    } catch (e: any) {
      setStatus("failed");
      setError(e.message || "Terminal simulation error");
    }
  }

  /* -------------------------------------------------------
     🔄 reset()
     Resets the reader back to:
       connected → waiting

     Used after completing a payment.
  ------------------------------------------------------- */
  function reset() {
    setStatus("connected");
    setError(null);

    setTimeout(() => {
      setStatus("waiting");
    }, 300);
  }

  /* -------------------------------------------------------
     📤 Exposed API
  ------------------------------------------------------- */
  return {
    status,
    error,
    connect,
    collectPayment,
    reset,
  };
}
