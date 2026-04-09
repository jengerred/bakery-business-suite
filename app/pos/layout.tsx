"use client";

/*
  POS Layout
  ----------
  This layout wraps all POS pages with:
  - Stripe Elements (for card payments)
  - OrderHistoryProvider (persistent order history)
  - CustomerProvider (customer lookup + loyalty foundation)
  - Global Toaster (notifications)
  
  It also renders a small top bar with a "Customer" button.
  This keeps page files tiny and maintains consistent POS UI structure.
*/

import { OrderHistoryProvider } from "./context/OrderHistoryContext";
import { CustomerProvider } from "./context/CustomerContext"; 
import { Toaster } from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import CustomerLookupModal from "./components/customer/CustomerLookupModal"; 
import { User } from "../types/user";
import { CartProvider } from "./context/CartContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function POSLayout({ children }: { children: React.ReactNode }) {
  // Local UI state for showing the customer lookup modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  return (
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
  );
}
