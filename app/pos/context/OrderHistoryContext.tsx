"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/app/types/product";

/* -------------------------------------------------------
   🧾 Order Types (Match C# DTO)
   ------------------------------------------------------- */
export type OrderItem = {
  product: Product;
  quantity: number;
};

export type CompletedOrder = {
  id?: string; // Optional because DB generates it
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: string;
  cardEntryMethod?: string;
  cashTendered?: number;
  changeGiven?: number;
  stripePaymentId?: string | null;
  
  // Use string to support ISO dates for C#
  timestamp: string; 

  customerId: string | null;
  customerName: string | null;
  status: string;
  fulfillmentType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

type OrderHistoryContextType = {
  orderHistory: CompletedOrder[];
  addOrder: (order: CompletedOrder) => Promise<void>;
  clearHistory: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const OrderHistoryContext = createContext<OrderHistoryContextType | null>(null);

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [orderHistory, setOrderHistory] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/orders`);
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
     ➕ Add order (FIXED: Uses DTO Wrapper)
     ------------------------------------------------------- */
  const addOrder = async (order: CompletedOrder) => {
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIXED: Backend requires the object to be wrapped in a "dto" property
        body: JSON.stringify({ dto: order }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend Validation Error:", errorData);
        throw new Error("Failed to save order to backend");
      }

      const saved = await res.json();
      setOrderHistory((prev) => [...prev, saved]);
    } catch (err: any) {
      setError(err.message);
      console.error("AddOrder Error:", err);
    }
  };

  const clearHistory = async () => {
    try {
      const res = await fetch(`${API}/api/orders`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear order history");
      setOrderHistory([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <OrderHistoryContext.Provider value={{ orderHistory, addOrder, clearHistory, loading, error }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistoryContext() {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error("useOrderHistoryContext must be used inside OrderHistoryProvider");
  return ctx;
}