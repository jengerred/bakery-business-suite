"use client";

import { useState } from "react";
import { Product } from "../../pos/lib/products";

type Props = {
  flavorName: string;
  singleProduct: Product;
  dozenProduct: Product;
  onAddToCart: (product: Product) => void;
};

export default function ShopProductCard({ 
  flavorName, 
  singleProduct, 
  dozenProduct, 
  onAddToCart 
}: Props) {
  const [isDozen, setIsDozen] = useState(false);

  // Switch between the two product objects based on the toggle
  const activeProduct = isDozen ? dozenProduct : singleProduct;

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* 🖼️ IMAGE SECTION */}
      <div className="aspect-square bg-stone-100 relative flex items-center justify-center text-7xl">
        {flavorName.includes("Cookie") ? "🍪" : "🍫"}
        
        {isDozen && (
          <div className="absolute top-4 right-4 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Best Value
          </div>
        )}
      </div>

      {/* 📝 CONTENT SECTION */}
      <div className="p-8">
        <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-1">
          {flavorName}
        </h3>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          Baked fresh daily in Grand Rapids. Perfect for sharing (or not).
        </p>

        {/* ↔️ TOGGLE SWITCH */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setIsDozen(false)}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              !isDozen ? "bg-white shadow-sm text-violet-600" : "text-stone-400"
            }`}
          >
            SINGLE
          </button>
          <button
            onClick={() => setIsDozen(true)}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              isDozen ? "bg-white shadow-sm text-violet-600" : "text-stone-400"
            }`}
          >
            DOZEN
          </button>
        </div>

        {/* 💰 PRICE & ACTION */}
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Price</span>
            <span className="text-2xl font-black text-stone-900">
              ${activeProduct.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => onAddToCart(activeProduct)}
            className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-sm hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}