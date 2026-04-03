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
  const activeProduct = isDozen ? dozenProduct : singleProduct;

  // Math for the savings percentage
  const savings = Math.round((1 - (dozenProduct.price / (singleProduct.price * 12))) * 100);

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-500">
      
      {/* 🖼️ IMAGE SECTION */}
      <div className="aspect-[16/9] bg-stone-100 relative flex items-center justify-center text-5xl">
        {flavorName.includes("Cookie") ? "🍪" : "🍫"}
        
        {isDozen && (
          <div className="absolute top-3 right-3 bg-violet-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-[0.2em] shadow-lg animate-in fade-in zoom-in">
            Best Value
          </div>
        )}
      </div>

      {/* 📝 CONTENT SECTION */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter leading-none">
            {flavorName}
          </h3>
          {/* Custom Bakery Subtext */}
          <p className="text-violet-400 text-[10px] font-black uppercase tracking-widest mt-1.5">
            Baked with Love
          </p>
        </div>

        {/* ↔️ TOGGLE SWITCH */}
        <div className="flex bg-stone-100 p-1.5 rounded-xl mb-5 relative">
          <button
            onClick={() => setIsDozen(false)}
            className={`flex-1 py-3 text-[11px] font-black rounded-lg transition-all ${
              !isDozen ? "bg-white shadow-md text-violet-600 scale-[1.02]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            SINGLE
          </button>
          
          <button
            onClick={() => setIsDozen(true)}
            className={`flex-1 py-3 text-[11px] font-black rounded-lg transition-all relative ${
              isDozen ? "bg-white shadow-md text-violet-600 scale-[1.02]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            DOZEN
            
            {/* BIGGER LILAC SAVINGS BADGE */}
            {!isDozen && (
               <span className="absolute -top-3 -right-2 bg-gradient-to-br from-violet-600 to-violet-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white animate-bounce tracking-tighter">
                 SAVE {savings}%
               </span>
            )}
          </button>
        </div>

        {/* 💰 PRICE & ACTION */}
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            {/* Removed "Total" label, kept clean price */}
            <span className="text-2xl font-black text-stone-900 tracking-tighter">
              ${activeProduct.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => onAddToCart(activeProduct)}
            className="px-6 py-4 bg-violet-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200/50 min-w-[135px]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}