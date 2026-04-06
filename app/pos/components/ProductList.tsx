"use client";

import { useState } from "react";
import { products, Product } from "../lib/products";

type ProductListProps = {
  onAdd: (product: Product, quantity: number, price?: number) => void;
};

export default function ProductList({ onAdd }: ProductListProps) {
  const flavors = ["Chocolate Chip Cookies", "Brownies", "Peanut Butter Cookies"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
      {flavors.map((flavor) => {
        const single = products.find(p => p.name === `${flavor} - Single`);
        const dozen = products.find(p => p.name === `${flavor} - Dozen`);

        if (!single || !dozen) return null;

        return (
          <POSFlavorCard 
            key={flavor} 
            flavor={flavor} 
            single={single} 
            dozen={dozen} 
            onAdd={onAdd} 
          />
        );
      })}
    </div>
  );
}

// Sub-component to handle local toggle state per card
function POSFlavorCard({ flavor, single, dozen, onAdd }: any) {
  const [isDozen, setIsDozen] = useState(false);
  const activeProduct = isDozen ? dozen : single;
  const isCookie = flavor.toLowerCase().includes("cookie");
  const savings = Math.round((1 - (dozen.price / (single.price * 12))) * 100);

  return (
    <div className="group relative flex flex-col bg-violet-300/60 border-2 border-violet-400 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-[0_0_40px_8px_rgba(167,139,250,0.6)]">
      
      {/* 🖼️ IMAGE/ICON SECTION - Shorter but same style */}
      <div className="h-24 relative flex items-center justify-center text-5xl group-hover:bg-violet-300 transition-colors duration-500">
        <span className="filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">
          {isCookie ? "🍪" : "🍫"}
        </span>
        
        {isDozen && (
          <div className="absolute top-2 right-3 bg-violet-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg animate-in zoom-in">
            Best Value
          </div>
        )}
      </div>

      {/* 📝 CONTENT SECTION */}
      <div className="p-4 flex flex-col flex-1 bg-white/80">
        <div className="mb-3 text-center">
          {/* Removed line-clamp to ensure the full name shows */}
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-[1.1] italic">
            {flavor}
          </h3>
          <p className="text-violet-600 text-[8px] font-black uppercase tracking-[0.3em] mt-1">
            Mother's Secret Recipe
          </p>
        </div>

        {/* ↔️ TOGGLE SWITCH - Compact style */}
        <div className="flex bg-violet-400/20 p-1 rounded-xl mb-4 relative border border-violet-400/30">
          <button
            onClick={() => setIsDozen(false)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
              !isDozen ? "bg-white shadow-md text-violet-600 scale-[1.02]" : "text-violet-900/50 hover:text-violet-900"
            }`}
          >
            SINGLE
          </button>
          
          <button
            onClick={() => setIsDozen(true)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all relative ${
              isDozen ? "bg-white shadow-md text-violet-600 scale-[1.02]" : "text-violet-900/50 hover:text-violet-900"
            }`}
          >
            DOZEN
            {!isDozen && (
               <span className="absolute -top-2.5 -right-1.5 bg-violet-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-violet-300 animate-bounce tracking-tighter">
                 -{savings}%
               </span>
            )}
          </button>
        </div>

        {/* 💰 PRICE & ACTION */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="shrink-0">
            <span className="text-xl font-black text-slate-900 tracking-tighter italic">
              ${activeProduct.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => onAdd(activeProduct, 1)}
            className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] hover:bg-violet-700 active:scale-95 transition-all shadow-xl shadow-violet-400/20"
          >
            Add To Order
          </button>
        </div>
      </div>
    </div>
  );
}