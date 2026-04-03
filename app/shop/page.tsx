"use client";

import { useState } from "react";
import Link from "next/link";
import { products, Product } from "../pos/lib/products";
import ShopProductCard from "./components/ShopProductCard";
import CartDrawer from "./components/CartDrawer";

// Explicitly define the Cart Item type
type CartItem = {
  product: Product;
  quantity: number;
};

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const flavors = [
    { name: "Chocolate Chip Cookies", singleId: 101, dozenId: 102 },
    { name: "Brownies", singleId: 201, dozenId: 202 },
    { name: "Peanut Butter Cookies", singleId: 301, dozenId: 302 },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(50%); } 
          100% { transform: translateX(-100%); }
        }

        .animate-ticker {
          display: inline-block;
          white-space: nowrap;
          animation: ticker 18s linear infinite; 
        }

        .glow-line-heavy {
          box-shadow: 0 4px 20px -2px rgba(167, 139, 250, 0.7);
        }
      `}</style>

      {/* 📢 LOGISTICS ONLY TICKER */}
      <div className="relative w-full h-12 overflow-hidden bg-stone-950 flex items-center border-b-2 border-violet-500 glow-line-heavy z-50">
        <div className="animate-ticker">
          <p className="text-sm font-black uppercase tracking-[0.4em] text-white flex items-center">
            
            {/* LOGISTICS SECTION 1 */}
            <span>
              <span className="text-violet-400 mr-2">📍 Pickup:</span> 
              Fridays @ 12:00PM (Nextech High)
            </span>

            <span className="mx-20 text-stone-800">//</span> 

            {/* LOGISTICS SECTION 2 */}
            <span>
              <span className="text-violet-400 mr-2">📦 Shipping:</span> 
              All orders sent every Friday
            </span>

            <span className="mx-20 text-stone-800">//</span> 

            {/* LOGISTICS SECTION 3 (Loop support) */}
            <span>
              <span className="text-violet-400 mr-2">📍 Pickup:</span> 
              Fridays @ 12:00PM (Nextech High)
            </span>

            <span className="mx-20 text-stone-800">//</span> 

            <span>
              <span className="text-violet-400 mr-2">📦 Shipping:</span> 
              All orders sent every Friday
            </span>
            
            <span className="ml-[20vw]"></span> 
          </p>
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center">
        <Link href="/shop" className="text-2xl font-black text-violet-600 uppercase tracking-tighter">
          The Bakery
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-2xl">
          🛒 {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {flavors.map((flavor) => {
            const single = products.find(p => p.id === flavor.singleId)!;
            const dozen = products.find(p => p.id === flavor.dozenId)!;
            
            return (
              <ShopProductCard 
                key={flavor.name}
                flavorName={flavor.name}
                singleProduct={single}
                dozenProduct={dozen}
                onAddToCart={handleAddToCart}
              />
            );
          })}
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} />
    </div>
  );
}