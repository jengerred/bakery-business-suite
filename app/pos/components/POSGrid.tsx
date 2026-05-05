"use client";

/* -------------------------------------------------------
📦 UI Components (Cashier-Side)
------------------------------------------------------- */
import { useState, useEffect } from "react";
import ProductList from "./ProductList";
import OrderSummary from "./OrderSummary";
import OrderTotals from "./OrderTotals";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import CardReaderContainer from "./card-reader/CardReaderContainer";
import POSNav from "./POSNav";

/* -------------------------------------------------------
👤 Context & Types
------------------------------------------------------- */
import { useCustomer } from "../context/CustomerContext";
import type { CompletedOrder } from "../context/OrderHistoryContext";
import { calculateTotals } from "../lib/calcTotals";
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

  /*  passed from POSPageContent */
  pickupOrderId?: string;
};

export default function POSGrid({
  order = [],
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
  pickupOrderId,   // ⭐ RECEIVED HERE
}: Props) {

  const { customer, setCustomer } = useCustomer();

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptMethod, setReceiptMethod] = useState<
    "print" | "email" | "text" | "none" | null | undefined
  >(undefined);

  const [isReaderActive, setIsReaderActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { total } = calculateTotals(order || []);
  const isOrderEmpty = !order || order.length === 0;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /* -------------------------------------------------------
  ⭐ Auto-load pickup order into POS cart
  ------------------------------------------------------- */
 useEffect(() => {
  async function loadPickupOrder() {
    if (!pickupOrderId) return;

    try {
      const allOrdersRes = await fetch(`${API_URL}/api/orders`);
      const allOrders = await allOrdersRes.json();

      const orderData = allOrders.find(
        (o: any) => o.id === pickupOrderId && o.fulfillmentType === "pickup"
      );

      if (!orderData) {
        console.error("Pickup order not found:", pickupOrderId);
        return;
      }

      const productsRes = await fetch(`${API_URL}/api/products`);
      const allProducts = await productsRes.json();

      const formatted = orderData.items.map((item: any) => {
        const realProduct = allProducts.find(
          (p: any) =>
            p.name.trim().toLowerCase() ===
            item.product.name.trim().toLowerCase()
        );

        return {
          product: realProduct,
          quantity: item.quantity,
          overridePrice: realProduct?.price,
        };
      });

      setOrder(formatted);

      setCustomer({
        id: orderData.customerId || "",
        name: orderData.customerName || "Guest",
        email: orderData.customerEmail || "",
        phone: orderData.customerPhone || "",
        loyaltyPoints: 0,
        role: "customer"
      });

    } catch (err) {
      console.error("Pickup order load error:", err);
    }
  }

  loadPickupOrder();
}, [pickupOrderId]);

  /* -------------------------------------------------------
  Reader Status
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
  Receipt Choice
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

 function handleCloseReceipt() {
  // 1️⃣ Close the modal immediately
  setShowReceipt(false);

  // 2️⃣ Reset receipt UI state
  setReceiptMethod(undefined);
  setIsReaderActive(false);

  // 3️⃣ Normal POS order → clear customer + finish
  if (!pickupOrderId) {
    setCustomer(null);
    window.dispatchEvent(new CustomEvent("cashier-receipt-done"));
    return;
  }

  // 4️⃣ Pickup order → redirect AFTER modal is closed
  // No timer needed — React unmounts the modal before this line executes
  window.location.href = "/pos/pickup";
}



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

  /* -------------------------------------------------------
  UI
  ------------------------------------------------------- */
  return (
    <div
      className="relative min-h-screen flex flex-col gap-4 px-8 py-2 overflow-hidden"
      style={{
        backgroundImage: "url('/bakery2-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-violet-300/70 z-0" />

      <POSNav active="register" />

      <div className="relative z-10 flex flex-col gap-4">

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 items-start min-[850px]:grid-cols-12">

          {/* MENU */}
          <div className="col-span-1 min-[850px]:col-span-8">
            <section className="p-6 border rounded-[2.5rem] bg-violet-950/90 shadow-xl shadow-violet-900 h-[480px] overflow-y-auto custom-scrollbar">
              <h2 className="p-1 pr-4 inline-block text-xl font-black text-violet-200 uppercase tracking-[0.2em] bg-violet-500/80 backdrop-blur-xl border border-violet-700/40 rounded-xl shadow-md">
                🧁 Our Menu 
              </h2>

              <ProductList
                onAdd={(product, qty, price) =>
                  openProductModal(product, qty, price)
                }
              />
            </section>
          </div>

          {/* CURRENT ORDER */}
          <div className="col-span-1 min-[850px]:col-span-4">
            <section
              className={`p-5 border rounded-[2.5rem] bg-violet-100/40 backdrop-blur-md px-6 transition-all border-violet-500 shadow-xl shadow-violet-900/50 flex flex-col relative overflow-hidden ${
                isExpanded ? "h-auto" : "h-[480px]"
              }`}
            >
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-black text-violet-600 uppercase tracking-wider">
                    Current Order
                  </h2>

                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-3 py-1 bg-violet-600/10 border border-violet-600/20 text-violet-600 text-[10px] font-black uppercase rounded-lg"
                  >
                    {isExpanded ? "Collapse" : "Expand All"}
                  </button>
                </div>

                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 mb-1">
                  <div
                    className={`flex-1 pr-2 custom-scrollbar scroll-smooth ${
                      isExpanded ? "" : "overflow-y-auto"
                    }`}
                  >
                    <OrderSummary
                      order={order}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                      onUpdateQty={handleUpdateQty}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-violet-500/30">
                <OrderTotals order={order} />
              </div>
            </section>
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <div className="mt-6">
          <div className="p-10 pb-15 bg-violet-950/90 border border-violet-500 rounded-[2.5rem]">
            <button
              onClick={handleBeginCheckout}
              disabled={isOrderEmpty}
              className={`w-full py-4 rounded-[1.8rem] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center justify-center gap-1 active:scale-95 ${
                isOrderEmpty
                  ? "bg-violet-900/20 text-violet-300/20 cursor-not-allowed"
                  : "bg-green-500 text-white shadow-xl shadow-green-300"
              }`}
            >
              <span className="text-4xl italic tracking-tighter drop-shadow-md">
                {isOrderEmpty ? "Empty Basket" : "Checkout"}
              </span>

              {!isOrderEmpty && (
                <span className="text-xl font-bold tracking-widest text-green-50">
                  Total: ${total.toFixed(2)}
                </span>
              )}
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
            pickupOrderId={pickupOrderId}
            onClose={() => {
              setShowCheckout(false);
              window.dispatchEvent(new CustomEvent("cashier-cancel-checkout"));
            }}
         onComplete={async (paymentData) => {

 // ⭐ PICKUP ORDER FLOW
if (pickupOrderId) {
  // Update backend order status 
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${pickupOrderId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newStatus: "PickedUp",
        pickup_time: new Date().toISOString(),
        cash_tendered: paymentData.cashTendered || null,
        change_given: paymentData.changeGiven || null,
        card_entry_method: paymentData.cardEntryMethod || null,
        stripe_payment_id: paymentData.stripePaymentId || null,
        payment_type: paymentData.paymentType || null
      }),
    }
  );

  // ⭐ Load updated order so receipt has data
  const updatedOrder = await res.json();
  setLastOrder(updatedOrder);

  // ⭐ Enable print for pickup orders
  setReceiptMethod("print");

  // ⭐ Show receipt BEFORE redirect
  setShowReceipt(true);

  // Reset POS cart + checkout modal
  setOrder([]);
  setShowCheckout(false);

  // ⭐ DO NOT redirect here — receipt won't show
  return;
}


  // ⭐ POS ORDER FLOW (normal walk‑in)
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
  CardEntryMethod: paymentData.cardEntryMethod || "",
  CashTendered: paymentData.cashTendered ?? null,
  ChangeGiven: paymentData.changeGiven ?? null,
  StripePaymentId: paymentData.stripePaymentId || "",

  CustomerId: customer?.id || "",
  CustomerName: customer?.name || "Guest",
  CustomerEmail: customer?.email || "",
  CustomerPhone: customer?.phone || "",

  Status: "completed",
  FulfillmentType: "POS",
  PickupTime: new Date().toISOString(),

  Address: customerData?.address || "",
  City: customerData?.city || "",
  State: customerData?.state || "MI",
  Zip: customerData?.zip || "",
  Notes: paymentData.notes || "",
};


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completedPayload),
    }
  );

  const savedOrder = await res.json();
      setLastOrder(savedOrder);

      if (paymentData.paymentType === "cash" || !customer) {
        setReceiptMethod("print");
        window.dispatchEvent(new CustomEvent("reader-force-thank-you"));
      } else {
        setReceiptMethod(undefined);
      }

      setShowReceipt(true);
      setOrder([]);
      setShowCheckout(false);
    }}

            />
        )}

        {showReceipt && lastOrder && (
          <div className="fixed top-0 left-0 h-full w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 overflow-y-auto">
            <ReceiptModal
              order={lastOrder}
              receiptMethod={receiptMethod as any}
              onClose={handleCloseReceipt}
            />
          </div>
        )}
      </div>
    </div>
  );
}
