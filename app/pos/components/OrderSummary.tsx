"use client";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type each item in the order.
------------------------------------------------------- */
import { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   👤 Customer Context
   Used to display the active customer (if any).
------------------------------------------------------- */
import { useCustomer } from "@/app/pos/context/CustomerContext";

/* -------------------------------------------------------
   🧾 OrderSummary (Cashier-Side)
   Displays the current cart with:
   - Customer name (if selected)
   - Product name
   - Line total
   - Quantity controls (+ / –)
   - Remove button

   NOTE:
   - This is the cashier-facing version.
   - The reader has its own read-only summary screen.
------------------------------------------------------- */
type OrderSummaryProps = {
  order: { product: Product; quantity: number }[];
  onIncrease: (productId: number) => void; // Increase quantity
  onDecrease: (productId: number) => void; // Decrease quantity
  onRemove: (productId: number) => void;   // Remove item entirely
};

export default function OrderSummary({
  order,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderSummaryProps) {

  /* -------------------------------------------------------
     👤 Active Customer (optional)
     Displayed above the order list.
  ------------------------------------------------------- */
  const { customer } = useCustomer();

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      {/* Customer name */}
      {customer?.name && (
        <p className="text-sm text-gray-700 mb-4">
          <strong>Customer:</strong> {customer.name}
        </p>
      )}

      {/* -------------------------------------------------------
         🪹 EMPTY STATE
      ------------------------------------------------------- */}
      {order.length === 0 && (
        <p className="text-gray-500">No items added yet.</p>
      )}

      {/* -------------------------------------------------------
         🛒 ORDER ITEMS
      ------------------------------------------------------- */}
      <ul className="space-y-4">
        {order.map((item) => (
          <li
            key={item.product.id}
            className="flex justify-between items-center"
          >
            {/* Product name + line total */}
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center space-x-2">

              {/* Decrease */}
              <button
                onClick={() => onDecrease(item.product.id)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                –
              </button>

              {/* Quantity */}
              <span className="w-8 text-center">{item.quantity}</span>

              {/* Increase */}
              <button
                onClick={() => onIncrease(item.product.id)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>

              {/* Remove */}
              <button
                onClick={() => onRemove(item.product.id)}
                className="px-2 py-1 text-red-600 hover:text-red-800"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
