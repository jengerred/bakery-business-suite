"use client";

import { useEffect, useState } from "react";
import ShopProductCard from "./components/ShopProductCard";
import CartDrawer from "./components/checkout/CartDrawer";
import LogisticsTicker from "./components/LogisticsTicker";
import ShopNavbar from "./components/ShopNavbar";
import type { Product } from "../types/product"; 



/* ---------------------------------------------
   Cart Item Type
   --------------------------------------------- */
type CartItem = {
  product: Product;
  quantity: number;
};

export default function ShopPage() {
  /* ---------------------------------------------
     State
     --------------------------------------------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* ---------------------------------------------
     Fetch real products from backend
     --------------------------------------------- */
  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("http://localhost:5240/api/products", {
        cache: "no-store",
      });
      const data = await res.json();
      setProducts(data);
    }
    loadProducts();
  }, []);

  /* ---------------------------------------------
     CART LOGIC
     --------------------------------------------- */

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleIncrement = (productId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
    );
  };

  const handleDecrement = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const sorted = products.sort((a, b) => a.sortOrder - b.sortOrder);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ---------------------------------------------
     Group backend products into flavor pairs
     --------------------------------------------- */
  const groupedFlavors = (() => {
    const map = new Map<
      string,
      { single?: Product; dozen?: Product }
    >();

    products.forEach((p) => {
      const baseName = p.name.replace(" - Single", "").replace(" - Dozen", "");

      if (!map.has(baseName)) {
        map.set(baseName, {});
      }

      if (p.name.includes("Single")) {
        map.get(baseName)!.single = p;
      } else if (p.name.includes("Dozen")) {
        map.get(baseName)!.dozen = p;
      }
    });

    return Array.from(map.entries()).map(([flavorName, pair]) => ({
      flavorName,
      singleProduct: pair.single,
      dozenProduct: pair.dozen,
    }));
  })();

  /* ---------------------------------------------
     UI
     --------------------------------------------- */
  return (
    <div className="min-h-screen bg-violet-300">
      <LogisticsTicker />

      <ShopNavbar
        cartCount={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-8 py-16 flex items-center justify-center min-h-[90vh]">
        <section
          className="
            w-full max-w-[1600px]
            -mt-8 p-6 border rounded-[2.5rem] bg-violet-950/90 shadow-xl shadow-violet-900
            min-h-[650px] md:min-h-[750px] lg:min-h-[80vh]
            flex flex-col items-center justify-center
            overflow-y-auto custom-scrollbar
          "
        >
          <h2 className="text-xl font-black mb-6 text-violet-200 uppercase tracking-[0.2em] sticky top-0 py-2 z-10">
            Menu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {groupedFlavors.map(({ flavorName, singleProduct, dozenProduct }) => {
              if (!singleProduct || !dozenProduct) return null;

              return (
                <ShopProductCard
                  key={flavorName}
                  flavorName={flavorName}
                  singleProduct={singleProduct}
                  dozenProduct={dozenProduct}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        </section>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />
    </div>
  );
}
