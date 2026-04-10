"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { createContext, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------
   🧺 Product Type
------------------------------------------------------- */
import { Product } from "@/app/types/product";

/* -------------------------------------------------------
   🧾 Order Types
------------------------------------------------------- */
export type OrderItem = {
  product: Product;
  quantity: number;
};

export type CompletedOrder = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;

  paymentType: "cash" | "credit" | "debit";
  cardEntryMethod?: "manual" | "terminal";

  cashTendered?: number;
  changeGiven?: number;

  stripePaymentId?: string;
  timestamp: number;

  customerId: string | null;
  customerName: string | null;
};

/* -------------------------------------------------------
   🧠 Context Shape
------------------------------------------------------- */
type OrderHistoryContextType = {
  orderHistory: CompletedOrder[];
  addOrder: (order: CompletedOrder) => Promise<void>;
  clearHistory: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

/* -------------------------------------------------------
   🏗️ Create Context
------------------------------------------------------- */
export const OrderHistoryContext =
  createContext<OrderHistoryContextType | null>(null);

/* -------------------------------------------------------
   🗂️ Provider (Backend‑Powered)
------------------------------------------------------- */
export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [orderHistory, setOrderHistory] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  /* -------------------------------------------------------
     📥 Load order history from backend on mount
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`${API}/orders`);
        if (!res.ok) throw new Error("Failed to load order history");

        const data = await res.json();
        setOrderHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [API]);

  /* -------------------------------------------------------
     ➕ Add order (POST to backend)
  ------------------------------------------------------- */
  const addOrder = async (order: CompletedOrder) => {
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Failed to save order");

      const saved = await res.json();

      // Update local state with backend response
      setOrderHistory((prev) => [...prev, saved]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* -------------------------------------------------------
     🗑️ Clear all orders (backend)
  ------------------------------------------------------- */
  const clearHistory = async () => {
    try {
      const res = await fetch(`${API}/orders`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to clear order history");

      setOrderHistory([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* -------------------------------------------------------
     🧠 Provide context
  ------------------------------------------------------- */
  return (
    <OrderHistoryContext.Provider
      value={{
        orderHistory,
        addOrder,
        clearHistory,
        loading,
        error,
      }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
}

/* -------------------------------------------------------
   🎣 Hook
------------------------------------------------------- */
export function useOrderHistoryContext() {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) {
    throw new Error("useOrderHistoryContext must be used inside OrderHistoryProvider");
  }
  return ctx;
}
