"use client";

import { OrderHistoryProvider } from "./context/OrderHistoryContext";
import { Toaster } from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      <OrderHistoryProvider>
        {children}
        <Toaster position="top-right" />
      </OrderHistoryProvider>
    </Elements>
  );
}
