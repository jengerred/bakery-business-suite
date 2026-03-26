"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   🧺 Product Type
   Represents a single item in the product catalog.
------------------------------------------------------- */
import { Product } from "../lib/products";

/* -------------------------------------------------------
   🛒 useCart
   Centralized cart logic for the POS.
   Handles:
   - Adding items
   - Editing quantities
   - Removing items
   - Opening/closing the product modal
   - Temporary quantity state for modal editing
------------------------------------------------------- */
export function useCart() {
  /* ------------------------------
     🧾 Cart State
     order = array of { product, quantity }
  ------------------------------ */
  const [order, setOrder] = useState<{ product: Product; quantity: number }[]>(
    []
  );

  /* ------------------------------
     🎛️ Product Modal State
     selectedProduct = product currently being edited
     tempQty = quantity shown inside the modal
  ------------------------------ */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempQty, setTempQty] = useState(1);

  /* -------------------------------------------------------
     🪟 openProductModal()
     Opens the modal for a product.
     If the product already exists in the cart,
     preload its current quantity.
------------------------------------------------------- */
  const openProductModal = (product: Product) => {
    const existing = order.find((i) => i.product.id === product.id);
    setSelectedProduct(product);
    setTempQty(existing ? existing.quantity : 1);
  };

  /* -------------------------------------------------------
     💾 saveProductChanges()
     Saves quantity changes from the modal.
     - If qty <= 0 → remove item
     - If exists → update quantity
     - If new → add to cart
------------------------------------------------------- */
  const saveProductChanges = (product: Product, newQty: number) => {
    if (newQty <= 0) {
      setOrder(order.filter((i) => i.product.id !== product.id));
      return;
    }

    const exists = order.find((i) => i.product.id === product.id);

    if (exists) {
      // Update existing item
      setOrder(
        order.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        )
      );
    } else {
      // Add new item
      setOrder([...order, { product, quantity: newQty }]);
    }

    setTempQty(newQty);
  };

  /* -------------------------------------------------------
     ❌ handleRemove()
     Removes an item from the cart entirely.
------------------------------------------------------- */
  const handleRemove = (productId: number) => {
    setOrder(order.filter((item) => item.product.id !== productId));
  };

  /* -------------------------------------------------------
     ➕ handleIncrease()
     Increases quantity by 1.
------------------------------------------------------- */
  const handleIncrease = (productId: number) => {
    setOrder(
      order.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /* -------------------------------------------------------
     ➖ handleDecrease()
     Decreases quantity by 1.
     If quantity hits 0 → remove item.
------------------------------------------------------- */
  const handleDecrease = (productId: number) => {
    setOrder(
      order
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* -------------------------------------------------------
     📤 Exposed API
------------------------------------------------------- */
  return {
    order,
    setOrder,
    selectedProduct,
    setSelectedProduct,
    tempQty,
    setTempQty,
    openProductModal,
    saveProductChanges,
    handleRemove,
    handleIncrease,
    handleDecrease,
  };
}
