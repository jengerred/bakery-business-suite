"use client";

/* -------------------------------------------------------
   📦 React & Next.js
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   🧠 Context (Global State)
------------------------------------------------------- */
import { useOrderHistoryContext } from "./context/OrderHistoryContext";
import type { CompletedOrder } from "./context/OrderHistoryContext";

/* -------------------------------------------------------
   🧩 Hooks (Local Logic)
------------------------------------------------------- */
import { useTerminalSimulation } from "./hooks/useTerminalSimulation";
import { useCart } from "./hooks/useCart";
import { useStripeRedirectToast } from "./hooks/useStripeRedirectToast";

/* -------------------------------------------------------
   🧱 Components (UI Building Blocks)
------------------------------------------------------- */
import ReaderStatusBadge from "./components/ReaderStatusBadge";
import ProductOptionsModal from "./components/ProductOptionsModal";
import POSGrid from "./components/POSGrid";

/* -------------------------------------------------------
   🛠️ Lib Helpers (Utilities & Business Logic)
------------------------------------------------------- */
import { createCompletedOrder } from "./lib/handleCheckout";

/* -------------------------------------------------------
   🖥️ POS Page Content
   This component orchestrates:
   - Cart state
   - Terminal simulation
   - Order creation
   - Checkout flow
   - Product options modal
------------------------------------------------------- */
export default function POSPageContent() {
  /* ------------------------------
     🧾 Local UI State
  ------------------------------ */
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);

  /* ------------------------------
     🧠 Global Order History
  ------------------------------ */
  const { addOrder } = useOrderHistoryContext();

  /* ------------------------------
     💳 Simulated Card Terminal
  ------------------------------ */
  const terminal = useTerminalSimulation();

  /* ------------------------------
     🛒 Cart Logic (Products, Qty, Modal)
  ------------------------------ */
  const {
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
  } = useCart();

  /* ------------------------------
     🔔 Stripe Redirect Toasts
     (Only used if redirect flow occurs)
  ------------------------------ */
  useStripeRedirectToast();

  /* ------------------------------
     🎨 Render UI
  ------------------------------ */
  return (
    <div className="p-4">
         {/* -------------------------------------------------------       

      {/* 🧱 Main POS Grid Layout */}
      <POSGrid
        order={order}
        setOrder={setOrder}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        tempQty={tempQty}
        openProductModal={openProductModal}
        saveProductChanges={saveProductChanges}
        handleRemove={handleRemove}
        handleIncrease={handleIncrease}
        handleDecrease={handleDecrease}
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        lastOrder={lastOrder}
        setLastOrder={setLastOrder}
        terminal={terminal}
        addOrder={(paymentData) => {
          // 🧮 Create completed order using helper
          const completed = createCompletedOrder(order, paymentData);

          addOrder(completed);
          setLastOrder(completed);

          // 🧹 Reset cart + close modal
          setOrder([]);
          setShowCheckout(false);
        }}
      />

      {/* 🛠️ Product Options Modal */}
      {selectedProduct && (
        <ProductOptionsModal
          product={selectedProduct}
          quantity={tempQty}
          existsInCart={!!order.find((i) => i.product.id === selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onSave={saveProductChanges}
          onDelete={(product) => {
            setOrder(order.filter((i) => i.product.id !== product.id));
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
