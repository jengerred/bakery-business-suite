"use client";

/* -------------------------------------------------------
📦 UI Components (Cashier-Side)
------------------------------------------------------- */
import { useState, useEffect } from "react";
import Link from "next/link";

import ProductList from "./ProductList";
import OrderSummary from "./OrderSummary";
import OrderTotals from "./OrderTotals";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import CardReaderContainer from "./card-reader/CardReaderContainer";
import LogoutModal from "./LogoutModal";

/* -------------------------------------------------------
👤 Context & Types
------------------------------------------------------- */
import { useCustomer } from "../context/CustomerContext";
import type { CompletedOrder } from "../context/OrderHistoryContext";
import { calculateTotals } from "../lib/calcTotals";

/* ⭐ Updated to use real backend Product type */
import type { Product } from "@/app/types/product";

type Props = {
  order: { product: Product; quantity: number; overridePrice?: number }[];
  setOrder: (order: any) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  tempQty: number;
  openProductModal: (product: Product, quantity?: number, price?: number) => void;
  saveProductChanges: (product: Product, qty: number, price?: number) => void;
  handleRemove: (id: number) => void;
  handleIncrease: (id: number) => void;
  handleDecrease: (id: number) => void;
  showCheckout: boolean;
  setShowCheckout: (v: boolean) => void;
  lastOrder: CompletedOrder | null;
  setLastOrder: (o: CompletedOrder | null) => void;
  terminal: any;
  addOrder: (o: CompletedOrder) => void;
};

export default function POSGrid({
  order = [], // Default to empty array to prevent .reduce crashes
  setOrder,
  selectedProduct,
  setSelectedProduct,
  tempQty,
  openProductModal,
  saveProductChanges,
  handleRemove,
  handleIncrease,
  handleDecrease,
  showCheckout,
  setShowCheckout,
  lastOrder,
  setLastOrder,
  terminal,
  addOrder,
}: Props) {
  const { customer, setCustomer } = useCustomer();

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMethod, setReceiptMethod] = useState<
    "print" | "email" | "text" | "none" | null | undefined
  >(undefined);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isReaderActive, setIsReaderActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Safely calculate total for UI
  const { total } = calculateTotals(order || []);
  const isOrderEmpty = !order || order.length === 0;

  const handleUpdateQty = (productId: number, newQty: number) => {
    setOrder((prev: any[]) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleBeginCheckout = () => {
    setShowCheckout(true);
    window.dispatchEvent(new CustomEvent("cashier-payment-enabled"));
  };

  useEffect(() => {
    function handleReaderStatus(e: any) {
      const status = e.detail.status;
      if (status === "waiting" || status === "collecting" || status === "processing") {
        setIsReaderActive(true);
      } else if (status === "idle") {
        setIsReaderActive(false);
      }
    }
    window.addEventListener("reader-status-update", handleReaderStatus);
    return () => window.removeEventListener("reader-status-update", handleReaderStatus);
  }, []);

  useEffect(() => {
    function handleReceiptChoice(e: any) {
      if (!lastOrder) return;
      setReceiptMethod(e.detail.method);
      setShowReceipt(true);
    }
    window.addEventListener("reader-receipt-choice", handleReceiptChoice);
    return () => window.removeEventListener("reader-receipt-choice", handleReceiptChoice);
  }, [lastOrder]);

  function handleCloseReceipt() {
    setShowReceipt(false);
    setCustomer(null);
    setReceiptMethod(undefined);
    setIsReaderActive(false);
    window.dispatchEvent(new CustomEvent("cashier-receipt-done"));
  }

  return (
    <div 
      className="relative min-h-screen flex flex-col gap-4 px-8 py-2 overflow-hidden" 
      style={{
        backgroundImage: "url('/bakery2-bg.png')", 
        backgroundSize: "cover",      
        backgroundPosition: "center", 
        backgroundRepeat: "no-repeat", 
        backgroundAttachment: "fixed"
      }}
    >
      <div className="absolute inset-0 bg-violet-300/70 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* NAV SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-2 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <button
              className="sm:hidden px-4 py-2 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              Menu
            </button>

            <div className="hidden sm:flex gap-3 p-1.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
              <button className="relative px-6 py-2.5 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md transition-all active:scale-95 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </span>
                Register
              </button>
              <Link href="/pos/transactions" className="px-6 py-2.5 bg-violet-200/40 hover:bg-violet-600 hover:text-white text-violet-700 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/20">
                Transactions
              </Link>
              <Link href="/pos/employee" className="px-6 py-2.5 bg-violet-100/50 hover:bg-violet-600 hover:text-white text-violet-700 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/20">
                Employee
              </Link>
            </div>
          </div>

          <button onClick={() => setIsLogoutOpen(true)} className="group flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-600 transition-all active:scale-90">
            Exit
          </button>

          <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={() => setIsLogoutOpen(false)} />
        </div>

        <div className="grid grid-cols-1 gap-6 items-start min-[850px]:grid-cols-12">
          <div className="col-span-1 min-[850px]:col-span-8">
            <section className="p-6 border rounded-[2.5rem] bg-violet-950/90 shadow-xl shadow-violet-900 h-[480px] overflow-y-auto custom-scrollbar">
              <h2 className="inline-block text-xl font-black text-violet-200 uppercase tracking-[0.2em] sticky top-0 z-10 bg-violet-500/80 backdrop-blur-xl border border-violet-700/40 px-4 py-2 rounded-xl shadow-md">🧁 Our Menu</h2>
              <ProductList onAdd={(product, qty, price) => openProductModal(product, qty, price)} />
            </section>
          </div>

          <div className="col-span-1 min-[850px]:col-span-4">
            <section className={`p-5 border rounded-[2.5rem] bg-violet-100/40 backdrop-blur-md px-6 transition-all border-violet-500 shadow-xl shadow-violet-900/50 flex flex-col relative overflow-hidden ${isExpanded ? 'h-auto' : 'h-[480px]'}`}>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-black text-violet-600 uppercase tracking-wider">Current Order</h2>
                  <button onClick={() => setIsExpanded(!isExpanded)} className="px-3 py-1 bg-violet-600/10 border border-violet-600/20 text-violet-600 text-[10px] font-black uppercase rounded-lg">
                    {isExpanded ? "Collapse" : "Expand All"}
                  </button>
                </div>
                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 mb-1">
                  <div className={`flex-1 pr-2 custom-scrollbar scroll-smooth ${isExpanded ? '' : 'overflow-y-auto'}`}>
                    <OrderSummary order={order} onIncrease={handleIncrease} onDecrease={handleDecrease} onRemove={handleRemove} onUpdateQty={handleUpdateQty} />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-violet-500/30">
                <OrderTotals order={order} />
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6">
          <div className="p-10 pb-15 bg-violet-950/90 border border-violet-500 rounded-[2.5rem]">
            <button
              onClick={handleBeginCheckout}
              disabled={isOrderEmpty}
              className={`w-full py-4 rounded-[1.8rem] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center justify-center gap-1 active:scale-95 ${
                isOrderEmpty ? "bg-violet-900/20 text-violet-300/20 cursor-not-allowed" : "bg-green-500 text-white shadow-xl shadow-green-300" 
              }`}
            >
              <span className="text-4xl italic tracking-tighter drop-shadow-md">{isOrderEmpty ? "Empty Basket" : "Checkout"}</span>
              {!isOrderEmpty && <span className="text-xl font-bold tracking-widest text-green-50">Total: ${total.toFixed(2)}</span>}
            </button>
          </div>
          <section className="mt-8 p-4 border rounded-[2rem] bg-white/60 backdrop-blur-xl border-violet-100 shadow-lg">
            <CardReaderContainer terminal={terminal} />
          </section>
        </div>

        {/* MODALS */}
        {showCheckout && (
          <CheckoutModal
            order={order}
            terminal={terminal}
            forceReaderMode={isReaderActive} 
            onClose={() => {
              setShowCheckout(false);
              window.dispatchEvent(new CustomEvent("cashier-cancel-checkout"));
            }}
            onComplete={(paymentData) => {
              // Safety check before running calculateTotals logic
              if (!order || order.length === 0) return;

              const { subtotal, tax, total: finalTotal } = calculateTotals(order);
              const customerData = customer as any;

              const completedPayload = {
                Items: order.map((item) => ({
                  Product: item.product,
                  Quantity: item.quantity,
                })),
                Subtotal: subtotal,
                Tax: tax,
                Total: finalTotal,
                PaymentType: paymentData.paymentType,
                CardEntryMethod: paymentData.cardEntryMethod || "none",
                CashTendered: paymentData.cashTendered || 0,
                ChangeGiven: paymentData.changeGiven || 0,
                StripePaymentId: paymentData.stripePaymentId || "",
                Timestamp: new Date().toISOString(), 
                CustomerId: customer?.id || "",
                CustomerName: customer?.name || "Guest",
                CustomerEmail: customer?.email || "",
                CustomerPhone: customer?.phone || "",
                Status: "paid",
                FulfillmentType: "POS",
                // ✅ FIX: Must be ISO string for C# DateTime column
                PickupTime: new Date().toISOString(), 
                Address: customerData?.address || "",
                City: customerData?.city || "",
                State: customerData?.state || "MI",
                Zip: customerData?.zip || "",
                // ✅ FIX: Notes can store the raw display text if needed
                Notes: paymentData.notes || "",
              };

              // ✅ FIX: Wrap in 'dto' key to match backend OrderDto parameter
              addOrder({ dto: completedPayload } as any);

              if (paymentData.paymentType === "cash" || !customer) {
                setReceiptMethod("none");
                window.dispatchEvent(new CustomEvent("reader-force-thank-you"));
              } else {
                setReceiptMethod(undefined);
              }

              setLastOrder(completedPayload as any); 
              setShowReceipt(true);
              setOrder([]);
              setShowCheckout(false);
            }}
          />
        )}
        {showReceipt && lastOrder && (
          <div className="fixed top-0 left-0 h-full w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 overflow-y-auto">
            <ReceiptModal order={lastOrder} receiptMethod={receiptMethod as any} onClose={handleCloseReceipt} />
          </div>
        )}
      </div>
    </div>
  );
}