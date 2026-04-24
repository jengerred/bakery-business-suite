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
  
 // Use createdAt to match Supabase convention
  createdAt: string; 

  pickupTime?: string;

  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null; 
  customerPhone: string | null;

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
     ➕ Add order (Uses DTO Wrapper)
     ------------------------------------------------------- */
  const addOrder = async (order: CompletedOrder) => {
    try {
      const payload = {
        dto: {
          // IDs & Timestamps
          Id: order.id || crypto.randomUUID(),
          Timestamp: new Date().toISOString(), // C# maps this to your created_at logic
          
          // Accounting (Ensure these are numbers)
          Subtotal: Number(order.subtotal) || 0,
          Tax: Number(order.tax) || 0,
          Total: Number(order.total) || 0,
          
          // Items (Send as a raw array, NOT JSON.stringify)
          Items: order.items, 

          // Payment Details
          PaymentType: order.paymentType,
          CardEntryMethod: order.cardEntryMethod || "",
          CashTendered: Number(order.cashTendered) || null,
          ChangeGiven: Number(order.changeGiven) || null,
          StripePaymentId: order.stripePaymentId || "",

          // Customer Info
          CustomerId: order.customerId || "",
          CustomerName: order.customerName || "Guest",
          CustomerEmail: order.customerEmail || "",
          CustomerPhone: order.customerPhone || "",

          // Fulfillment (The new missing pieces)
          Status: "completed", // Default to completed if not provided
          FulfillmentType:"POS",
          PickupTime: order.pickupTime || "", // Added this specifically
          
          // Address Info
          Address: order.address || "",
          City: order.city || "",
          State: order.state || "",
          Zip: order.zip || "",
          Notes: order.notes || ""
        }
      };

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend Error:", errorText);
        throw new Error("Backend rejected the data mapping.");
      }

      const saved = await res.json();
      setOrderHistory((prev) => [...prev, saved]);
    } catch (err: any) {
      setError(err.message);
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