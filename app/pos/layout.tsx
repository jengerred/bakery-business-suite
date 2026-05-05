"use client";

/*
  POS Layout
  ----------
  This layout wraps all POS pages with:
  - AuthProvider (employee login + JWT)
  - Stripe Elements (for card payments)
  - OrderHistoryProvider (persistent order history)
  - CustomerProvider (customer lookup + loyalty foundation)
  - CartProvider (cart state)
  - Global Toaster (notifications)
*/

import { OrderHistoryProvider } from "./context/OrderHistoryContext";
import { CustomerProvider } from "./context/CustomerContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./AuthProvider"; // ⭐ NEW
import { Toaster } from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <OrderHistoryProvider>
          <CustomerProvider>
            <CartProvider>

              {/* Render the actual POS page */}
              {children}

              {/* Global toaster for notifications */}
              <Toaster position="top-right" />

            </CartProvider>
          </CustomerProvider>
        </OrderHistoryProvider>
      </Elements>
    </AuthProvider>
  );
}
