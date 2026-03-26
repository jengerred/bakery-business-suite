"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { createContext, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------
   🧺 Product Type
   Used inside OrderItem.
------------------------------------------------------- */
import { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   🧾 Order Types
   Exported so POSPage and other components can use them.
------------------------------------------------------- */
export type OrderItem = {
  product: Product;   // Product purchased
  quantity: number;   // Quantity purchased
};

export type CompletedOrder = {
  id: string;                     // Unique order ID
  items: OrderItem[];             // Line items
  subtotal: number;               // Pre‑tax amount
  tax: number;                    // Tax amount
  total: number;                  // Final total

  paymentType: "cash" | "credit" | "debit"; // Payment method
  cardEntryMethod?: "manual" | "terminal";  // For card payments

  cashTendered?: number;          // For cash payments
  changeGiven?: number;           // For cash payments

  stripePaymentId?: string;       // For card payments
  timestamp: number;              // When the order was completed
};

/* -------------------------------------------------------
   🧠 Context Shape
   Defines what the provider exposes to the app.
------------------------------------------------------- */
type OrderHistoryContextType = {
  orderHistory: CompletedOrder[];          // All saved orders
  addOrder: (order: CompletedOrder) => void; // Add a new order
  clearHistory: () => void;                // Remove all orders
};

/* -------------------------------------------------------
   🏗️ Create Context
------------------------------------------------------- */
export const OrderHistoryContext =
  createContext<OrderHistoryContextType | null>(null);

/* -------------------------------------------------------
   🗂️ Provider Component
   Wraps the POS app and manages persistent order history.
   - Loads from localStorage on mount
   - Saves to localStorage on updates
------------------------------------------------------- */
export function OrderHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ------------------------------
     📦 Local State
  ------------------------------ */
  const [history, setHistory] = useState<CompletedOrder[]>([]);

  /* ------------------------------
     📥 Load history on mount
  ------------------------------ */
  useEffect(() => {
    const saved = localStorage.getItem("orderHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  /* ------------------------------
     💾 Save history to localStorage
  ------------------------------ */
  const saveHistory = (orders: CompletedOrder[]) => {
    localStorage.setItem("orderHistory", JSON.stringify(orders));
    setHistory(orders);
  };

  /* ------------------------------
     ➕ Add a completed order
  ------------------------------ */
  const addOrder = (order: CompletedOrder) => {
    const updated = [...history, order];
    saveHistory(updated);
  };

  /* ------------------------------
     🗑️ Clear all order history
  ------------------------------ */
  const clearHistory = () => {
    saveHistory([]);
  };

  /* ------------------------------
     🧠 Provide context to children
  ------------------------------ */
  return (
    <OrderHistoryContext.Provider
      value={{ orderHistory: history, addOrder, clearHistory }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
}

/* -------------------------------------------------------
   🎣 useOrderHistoryContext
   Hook for accessing the order history context.
   Ensures it is used inside the provider.
------------------------------------------------------- */
export function useOrderHistoryContext() {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) {
    throw new Error(
      "useOrderHistoryContext must be used inside OrderHistoryProvider"
    );
  }
  return ctx;
}
