"use client";

import { useState } from "react";
import { products, Product } from "../pos/lib/products";
import ShopProductCard from "./components/ShopProductCard";
import CartDrawer from "./components/checkout/CartDrawer";
import LogisticsTicker from "./components/LogisticsTicker";
import ShopNavbar from "./components/ShopNavbar";

// Types
type CartItem = {
  product: Product;
  quantity: number;
};

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- CART LOGIC ---

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

  const handleDecrement = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        )
        // Remove item from cart if quantity drops to 0
        .filter((item) => item.quantity > 0)
    );
  };

  const flavors = [
    { name: "Chocolate Chip Cookies", singleId: 101, dozenId: 102 },
    { name: "Brownies", singleId: 201, dozenId: 202 },
    { name: "Peanut Butter Cookies", singleId: 301, dozenId: 302 },
  ];

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Reusable Logistics Header */}
      <LogisticsTicker />

      {/* Reusable Navbar */}
      <ShopNavbar cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} />

     <main className="max-w-7xl mx-auto px-8 py-16 flex items-center justify-center min-h-[70vh]">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {flavors.map((flavor) => {
            const single = products.find(p => p.id === flavor.singleId);
            const dozen = products.find(p => p.id === flavor.dozenId);
            
            if (!single || !dozen) return null;

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

      {/* Checkout Sidebar */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
}