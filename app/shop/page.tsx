"use client";


/* ----------------------------------------------------------
   Imports
   --------------------------------------------------------- */
import { useEffect, useState } from "react";
import ShopProductCard from "./components/ShopProductCard";
import CartDrawer from "./components/checkout/CartDrawer";
import LogisticsTicker from "./components/LogisticsTicker";
import ShopNavbar from "./components/ShopNavbar";
import type { Product } from "../types/product";

/* ---------------------------------------------------------
   Types
   --------------------------------------------------------- */
type CartItem = {
  product: Product;
  quantity: number;
};

/* ---------------------------------------------------------
   SHOP PAGE (Main Component)
   --------------------------------------------------------- */
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    }
    loadProducts();
  }, []);

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
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const handleDecrement = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const groupedFlavors = (() => {
    const map = new Map<string, { single?: Product; dozen?: Product }>();
    sorted.forEach((p) => {
      const baseName = p.name.replace(" - Single", "").replace(" - Dozen", "");
      if (!map.has(baseName)) map.set(baseName, {});
      if (p.name.includes("Single")) map.get(baseName)!.single = p;
      else if (p.name.includes("Dozen")) map.get(baseName)!.dozen = p;
    });
    return Array.from(map.entries()).map(([flavorName, pair]) => ({
      flavorName,
      singleProduct: pair.single,
      dozenProduct: pair.dozen,
    }));
  })();

  return (
    <div className="min-h-screen bg-violet-300">
      <LogisticsTicker />
      <ShopNavbar cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} />

      {/* ✅ MODIFIED: Reduced px-8 to px-4 on mobile to give more room */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-15 flex items-center justify-center min-h-[50vh]">
        <section
          className="
            w-full max-w-[1600px]
             p-4 md:p-6 border rounded-[2.5rem] bg-violet-950/90 shadow-xl shadow-violet-900
            min-h-[650px] md:min-h-[750px] lg:min-h-[80vh]
            flex flex-col items-center
            overflow-y-auto custom-scrollbar
          "
        >
          <h2 className="text-2xl font-black mb-8 text-violet-200 uppercase tracking-[0.2em] sticky top-0  z-10 w-full text-center">
            🧁 Menu
          </h2>

          {/* ✅ MODIFIED: Responsive Grid logic matches POS 
              - grid-cols-2 starts much earlier (sm)
              - gap reduced from 12 to 4/6 to stop cards from being huge
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 w-full">
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