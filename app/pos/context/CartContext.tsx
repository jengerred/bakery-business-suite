"use client";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type items stored in the cart.
------------------------------------------------------- */
import { createContext, useContext, useState } from "react";
import type { Product } from "../lib/products";

/* -------------------------------------------------------
   🛒 CartItem Type
   Represents a single line item in the cart.
------------------------------------------------------- */
type CartItem = { product: Product; quantity: number };

/* -------------------------------------------------------
   🧠 CartContext Shape
   Provides:
   - order (cart items)
   - selectedProduct (for modal editing)
   - tempQty (temporary quantity while editing)
   - handlers for add/update/remove/increase/decrease
------------------------------------------------------- */
type CartContextType = {
  order: CartItem[];
  setOrder: (items: CartItem[]) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  tempQty: number;
  setTempQty: (n: number) => void;
  openProductModal: (p: Product) => void;
  saveProductChanges: (p: Product, qty: number) => void;
  handleRemove: (id: number) => void;
  handleIncrease: (id: number) => void;
  handleDecrease: (id: number) => void;
};

/* -------------------------------------------------------
   🧱 Create Context
------------------------------------------------------- */
const CartContext = createContext<CartContextType | null>(null);

/* -------------------------------------------------------
   🧱 CartProvider
   Wraps the POS and exposes cart state + handlers.

   Responsibilities:
   - Manage cart items
   - Manage product editing modal state
   - Provide quantity manipulation helpers
   - Keep logic centralized and reusable
------------------------------------------------------- */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempQty, setTempQty] = useState(1);


    /* -------------------------------------------------------
     🪟 Open Product Modal
     Pre-fills quantity if product already exists in cart.
  ------------------------------------------------------- */
  const openProductModal = (product: Product) => {
    const existing = order.find((i) => i.product.id === product.id);
    setSelectedProduct(product);
    setTempQty(existing ? existing.quantity : 1);
  };


    /* -------------------------------------------------------
     💾 Save Product Changes
     - If qty <= 0 → remove item
     - If exists → update quantity
     - Else → add new item
  ------------------------------------------------------- */
  const saveProductChanges = (product: Product, newQty: number) => {
    if (newQty <= 0) {
      setOrder(order.filter((i) => i.product.id !== product.id));
      return;
    }

    const exists = order.find((i) => i.product.id === product.id);

    if (exists) {
      setOrder(
        order.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        )
      );
    } else {
      setOrder([...order, { product, quantity: newQty }]);
    }

    setTempQty(newQty);
  };


  /* -------------------------------------------------------
     ❌ Remove Item
  ------------------------------------------------------- */
  const handleRemove = (productId: number) => {
    setOrder(order.filter((item) => item.product.id !== productId));
  };

   /* -------------------------------------------------------
     ➕ Increase Quantity
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
     ➖ Decrease Quantity
     Removes item if quantity hits zero.
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

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* -------------------------------------------------------
   🪝 useCartContext
   Hook for accessing cart state + actions.
------------------------------------------------------- */
export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be inside CartProvider");
  return ctx;
}
