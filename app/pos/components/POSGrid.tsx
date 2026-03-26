"use client";

/* -------------------------------------------------------
   🧱 UI Components
------------------------------------------------------- */
import ProductList from "./ProductList";
import OrderSummary from "./OrderSummary";
import OrderTotals from "./OrderTotals";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import OrderHistory from "./OrderHistory";

/* -------------------------------------------------------
   🧾 Types & Helpers
------------------------------------------------------- */
import type { CompletedOrder } from "../context/OrderHistoryContext";
import { calculateTotals } from "../lib/calcTotals";
import { Product } from "../lib/products";

/* -------------------------------------------------------
   🧩 Props
   POSGrid orchestrates the entire POS layout:
   - Product list
   - Cart summary
   - Totals
   - Checkout modal
   - Receipt modal
   - Order history
------------------------------------------------------- */
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
   The main layout container for the POS interface.
   Handles:
   - Product browsing
   - Cart management
   - Checkout flow
   - Receipt display
   - Order history
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
  return (
    <div className="grid grid-cols-2 gap-6">

      {/* -------------------------------------------------------
         🛒 PRODUCT LIST
      ------------------------------------------------------- */}
      <section className="p-4 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <ProductList onAdd={openProductModal} />
      </section>

      {/* -------------------------------------------------------
         📦 ORDER SUMMARY
      ------------------------------------------------------- */}
      <OrderSummary
        order={order}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
      />

      {/* -------------------------------------------------------
         💵 TOTALS
      ------------------------------------------------------- */}
      <OrderTotals order={order} />

      {/* -------------------------------------------------------
         💳 CHECKOUT BUTTON
      ------------------------------------------------------- */}
      <button
        onClick={() => setShowCheckout(true)}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Checkout
      </button>

      {/* -------------------------------------------------------
         🧾 CHECKOUT MODAL
         Handles payment + creates CompletedOrder
      ------------------------------------------------------- */}
      {showCheckout && (
        <CheckoutModal
          order={order}
          terminal={terminal}
          onClose={() => setShowCheckout(false)}
          onComplete={(paymentData) => {
            // Calculate totals
            const { subtotal, tax, total } = calculateTotals(order);

            // Build completed order object
            const completed: CompletedOrder = {
              id: crypto.randomUUID(),
              items: order,
              subtotal,
              tax,
              total,
              paymentType: paymentData.paymentType,
              cardEntryMethod: paymentData.cardEntryMethod,
              cashTendered: paymentData.cashTendered,
              changeGiven: paymentData.changeGiven,
              stripePaymentId: paymentData.stripePaymentId,
              timestamp: Date.now(),
            };

            // Save to history + show receipt
            addOrder(completed);
            setLastOrder(completed);

            // Reset cart + close modal
            setOrder([]);
            setShowCheckout(false);
          }}
        />
      )}

      {/* -------------------------------------------------------
         🧾 RECEIPT MODAL
         Shown after a successful checkout
      ------------------------------------------------------- */}
      {lastOrder && (
        <ReceiptModal
          order={lastOrder}
          onClose={() => setLastOrder(null)}
        />
      )}

      {/* -------------------------------------------------------
         📜 ORDER HISTORY
      ------------------------------------------------------- */}
      <OrderHistory />
    </div>
  );
}
