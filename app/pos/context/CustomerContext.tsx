"use client";

/* -------------------------------------------------------
   👤 User Type
   Represents a customer record in the POS.
------------------------------------------------------- */
import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "../types/user";

/* -------------------------------------------------------
   🧠 CustomerContext Type
   Provides:
   - customer (active customer or null)
   - setCustomer() to assign a customer
   - clearCustomer() to reset after checkout
------------------------------------------------------- */
type CustomerContextType = {
  customer: User | null;
  setCustomer: (c: User | null) => void;
  clearCustomer: () => void;
};

/* -------------------------------------------------------
   🧱 Create Context
------------------------------------------------------- */
const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

/* -------------------------------------------------------
   🧱 CustomerProvider
   Wraps the POS and exposes customer state.

   Responsibilities:
   - Store the active customer (if any)
   - Allow cashier or reader to set a customer
   - Clear customer after checkout or cancellation

   NOTE:
   - This context is intentionally tiny.
   - Customer data is simple and does not require reducers.
------------------------------------------------------- */
export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<User | null>(null);

  const clearCustomer = () => setCustomer(null);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, clearCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

/* -------------------------------------------------------
   🪝 useCustomer
   Hook for accessing customer state + actions.
------------------------------------------------------- */
export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer must be used inside CustomerProvider");
  }
  return ctx;
}
