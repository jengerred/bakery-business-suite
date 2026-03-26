"use client";

/* -------------------------------------------------------
   📦 React & Next.js
------------------------------------------------------- */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* -------------------------------------------------------
   🔔 Toast Notifications
   react-hot-toast is used for success/error messages.
------------------------------------------------------- */
import { toast } from "react-hot-toast";

/* -------------------------------------------------------
   🎉 useStripeRedirectToast
   Displays toast notifications when Stripe Checkout
   redirects back to the POS page with:
     - ?success=true
     - ?canceled=true

   ⚠️ NOTE:
   This is ONLY used when using Stripe Checkout Redirect.
   It is NOT needed for Stripe Elements.
------------------------------------------------------- */
export function useStripeRedirectToast() {
  /* ------------------------------
     🔍 Read URL query parameters
  ------------------------------ */
  const params = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  /* ------------------------------
     🔔 Show toast messages on redirect
     Runs whenever the URL params change.
  ------------------------------ */
  useEffect(() => {
    if (success) toast.success("Payment successful!");
    if (canceled) toast.error("Payment canceled.");
  }, [success, canceled]);
}
