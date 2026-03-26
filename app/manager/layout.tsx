"use client";

/* -------------------------------------------------------
   🧠 OrderHistoryProvider
   Wraps the Manager Dashboard so it can read all completed
   orders from the shared POS order history context.
------------------------------------------------------- */
import { OrderHistoryProvider } from "../pos/context/OrderHistoryContext";

/* -------------------------------------------------------
   🔔 Toast Notifications
   Used for any manager‑side alerts (future features).
------------------------------------------------------- */
import { Toaster } from "react-hot-toast";

/* -------------------------------------------------------
   🗂️ ManagerLayout
   This layout is applied ONLY to the /manager route.
   It provides:
   - Order history context
   - Toast notifications
   - A clean wrapper for all manager pages

   Note:
   Unlike the POS layout, this layout does NOT include
   Stripe Elements or POS‑specific providers.
------------------------------------------------------- */
export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderHistoryProvider>
      {children}

      {/* Toasts appear in the top-right corner */}
      <Toaster position="top-right" />
    </OrderHistoryProvider>
  );
}
