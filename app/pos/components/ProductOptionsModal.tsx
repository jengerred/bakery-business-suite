"use client";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type the selected product.
------------------------------------------------------- */
import { Product } from "../lib/products";

/* -------------------------------------------------------
   🪟 ProductOptionsModal
   Modal for adjusting quantity or deleting a product
   before adding/updating it in the cart.
------------------------------------------------------- */
type ProductOptionsModalProps = {
  product: Product;                                // Product being edited
  quantity: number;                                // Current quantity (from cart or default 1)
  existsInCart: boolean;                           // Whether this product is already in the cart
  onClose: () => void;                             // Close modal
  onSave: (product: Product, newQty: number) => void; // Save quantity changes
  onDelete: (product: Product) => void;            // Remove product from cart
};

export default function ProductOptionsModal({
  product,
  quantity,
  existsInCart,
  onClose,
  onSave,
  onDelete,
}: ProductOptionsModalProps) {
  // Safety check — shouldn't happen, but prevents rendering errors
  if (!product) return null;

  /* ------------------------------
     🎨 Render Modal UI
  ------------------------------ */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow">

        {/* -------------------------------------------------------
           🏷️ PRODUCT HEADER
        ------------------------------------------------------- */}
        <h2 className="text-lg font-semibold mb-3">{product.name}</h2>
        <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>

        {/* -------------------------------------------------------
           🔢 QUANTITY SELECTOR
        ------------------------------------------------------- */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-600">Quantity</span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(product, quantity - 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              –
            </button>

            <span className="w-8 text-center">{quantity}</span>

            <button
              onClick={() => onSave(product, quantity + 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------
           🗑️ DELETE + SAVE BUTTONS
        ------------------------------------------------------- */}
        <div className="flex justify-between items-center">

          {/* Only show delete if item is already in cart */}
          {existsInCart && (
            <button
              onClick={() => onDelete(product)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}

          {/* Add or Update button */}
          <button
            onClick={() => {
              onSave(product, quantity);
              onClose();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded ml-auto"
          >
            {existsInCart ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
