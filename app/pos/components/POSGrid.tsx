"use client";

/* -------------------------------------------------------
   📦 UI Components (Cashier-Side)
   These make up the core of the Register interface.
------------------------------------------------------- */
import { useState, useEffect } from "react";
import Link from "next/link";
import ProductList from "./ProductList";
import OrderSummary from "./OrderSummary";
import OrderTotals from "./OrderTotals";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import CardReaderContainer from "./card-reader/CardReaderContainer";

/* -------------------------------------------------------
   👤 Context & Types
------------------------------------------------------- */
import { useCustomer } from "../context/CustomerContext";
import type { CompletedOrder } from "../context/OrderHistoryContext";
import { calculateTotals } from "../lib/calcTotals";
import { Product } from "../lib/products";

type Props = {
  order: { product: Product; quantity: number }[];
  setOrder: (order: any) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  tempQty: number;
  openProductModal: (product: Product) => void;
  saveProductChanges: (product: Product, qty: number) => void;
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

/* -------------------------------------------------------
   🧱 POSGrid
   The central orchestrator for the Point of Sale interface.
   
   Responsibilities:
   - Coordinate between the Product Catalog and Order Summary.
   - Manage the visibility of Checkout and Receipt modals.
   - Sync Reader hardware states with the Cashier UI.
   - Process finalized orders and reset state for new transactions.
------------------------------------------------------- */
export default function POSGrid({
  order,
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
  
  /* -------------------------------------------------------
     🧾 Receipt & UI State
  ------------------------------------------------------- */
  const [showReceipt, setShowReceipt] = useState(false);
  
  // undefined = locked (waiting for choice) | null = immediate (cash or no choice needed)
  const [receiptMethod, setReceiptMethod] = useState<"print" | "email" | "text" | "none" | null | undefined>(undefined);

  /* -------------------------------------------------------
     🎯 Auto-Sync State
     Tracks if the reader hardware is currently active to 
     automatically flip the Cashier UI to Card mode.
  ------------------------------------------------------- */
  const [isReaderActive, setIsReaderActive] = useState(false);

  const { total } = calculateTotals(order);

  /* -------------------------------------------------------
     💳 Checkout Lifecycle
  ------------------------------------------------------- */
  const handleBeginCheckout = () => {
    setShowCheckout(true);
    // Notify hardware simulation that payment flow has begun
    window.dispatchEvent(new CustomEvent("cashier-payment-enabled"));
  };

  /* -------------------------------------------------------
     📡 Hardware Listeners (Reader Sync)
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReaderStatus(e: any) {
      const status = e.detail.status;
      // Automatically switch Cashier view to 'Card' if customer interacts with reader
      if (status === "waiting" || status === "collecting" || status === "processing") {
        setIsReaderActive(true);
      } else if (status === "idle") {
        setIsReaderActive(false);
      }
    }
    window.addEventListener("reader-status-update", handleReaderStatus);
    return () => window.removeEventListener("reader-status-update", handleReaderStatus);
  }, []);

  /* -------------------------------------------------------
     📡 Receipt Event Listeners
  ------------------------------------------------------- */
  useEffect(() => {
    function handleReceiptChoice(e: any) {
      if (!lastOrder) return;
      setReceiptMethod(e.detail.method);
      setShowReceipt(true);
    }
    window.addEventListener("reader-receipt-choice", handleReceiptChoice);
    return () => window.removeEventListener("reader-receipt-choice", handleReceiptChoice);
  }, [lastOrder]);

  // Fallback for customers who walk away without picking a receipt method
  useEffect(() => {
    if (showReceipt && receiptMethod === undefined) {
      const timer = setTimeout(() => {
        setReceiptMethod(null); 
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [showReceipt, receiptMethod]);

  /* -------------------------------------------------------
     🧹 Cleanup & Reset
  ------------------------------------------------------- */
  function handleCloseReceipt() {
    setShowReceipt(false);
    setCustomer(null);
    setReceiptMethod(undefined); 
    setIsReaderActive(false); 
    // Reset hardware simulation to idle state
    window.dispatchEvent(new CustomEvent("cashier-receipt-done"));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 📑 NAVIGATION TABS */}
      <div className="flex border-b border-gray-200">
        <button className="px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-bold">
          Register
        </button>
        <Link href="/pos/transactions" className="px-6 py-2 text-gray-500 hover:text-blue-600 transition-colors">
          Transactions
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN: Product Catalog */}
        <div className="col-span-8">
          <section className="p-4 border rounded-lg bg-white shadow min-h-[600px]">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <ProductList onAdd={openProductModal} />
          </section>
        </div>

        {/* RIGHT COLUMN: Order Details & Hardware Status */}
        <div className="col-span-4 space-y-6">
          <section className="p-4 border rounded-lg bg-white shadow">
            <div className="mb-4">
              <OrderSummary
                order={order}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <OrderTotals order={order} />
              <button
                onClick={handleBeginCheckout}
                disabled={order.length === 0}
                className="w-full mt-6 py-6 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98]"
              >
                <span className="text-2xl uppercase tracking-wide">Checkout</span>
                <span className="text-xl font-medium opacity-90">Pay: ${total.toFixed(2)}</span>
              </button>
            </div>
          </section>

          {/* Reader UI Container */}
          <section className="p-4 border rounded-lg bg-white shadow">
            <CardReaderContainer terminal={terminal} />
          </section>
        </div>
      </div>

      {/* 💳 CHECKOUT MODAL OVERLAY */}
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
            const { subtotal, tax, total: finalTotal } = calculateTotals(order);
            const completed: CompletedOrder = {
              id: crypto.randomUUID(),
              items: order,
              subtotal,
              tax,
              total: finalTotal,
              paymentType: paymentData.paymentType,
              cardEntryMethod: paymentData.cardEntryMethod,
              cashTendered: paymentData.cashTendered,
              changeGiven: paymentData.changeGiven,
              stripePaymentId: paymentData.stripePaymentId,
              timestamp: Date.now(),
              customerId: customer?.id ?? null,
              customerName: customer?.name ?? null,
            };
            
            addOrder(completed);
            setLastOrder(completed);
            
            // Handle post-payment reader behavior
            if (paymentData.paymentType === "cash" || !customer) {
               window.dispatchEvent(new CustomEvent("reader-force-thank-you"));
               setReceiptMethod(null);
            } else {
               setReceiptMethod(undefined);
            }

            setShowReceipt(true);
            setOrder([]);
            setShowCheckout(false);
          }}
        />
      )}

      {/* 🧾 RECEIPT MODAL OVERLAY */}
      {showReceipt && lastOrder && (
        <div className="fixed top-0 left-0 h-full w-[420px] bg-white shadow-2xl z-50 p-6 overflow-y-auto">
          <ReceiptModal
            order={lastOrder}
            receiptMethod={receiptMethod as any}
            onClose={handleCloseReceipt}
          />
        </div>
      )}
    </div>
  );
}