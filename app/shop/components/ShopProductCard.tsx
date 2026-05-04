"use client";

import { useState } from "react";
import { Product } from "@/app/types/product";

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
  onAddToCart,
}: Props) {
  const [isDozen, setIsDozen] = useState(false);

  // ⭐ Active product selection
  const activeProduct = isDozen ? dozenProduct : singleProduct;

  const savings = Math.round(
    (1 - dozenProduct.price / (singleProduct.price * 12)) * 100
  );

  // ✅ Inventory & Urgency Logic
  const isSoldOut =
    activeProduct.trackInventory === true &&
    (activeProduct.stockQuantity ?? 0) <= 0;

  const isLowStock =
    activeProduct.trackInventory === true &&
    (activeProduct.stockQuantity ?? 0) > 0 &&
    (activeProduct.stockQuantity ?? 0) <= 5;

  return (
    <div className={`group relative flex flex-col bg-violet-400/50 border-2 border-violet-400 rounded-[2rem] overflow-hidden transition-all duration-500 
    hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-[0_0_40px_8px_rgba(167,139,250,0.6)] ${isSoldOut ? 'grayscale-[0.5] opacity-80' : ''}`}>
      
      {/* 🖼️ IMAGE SECTION */}
      <div className="h-50 relative flex items-center justify-center text-5xl group-hover:bg-violet-300 transition-colors duration-500">
        <img
          src={activeProduct.imageUrl}   
          alt={activeProduct.name}       
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* ✅ Sold Out Badge Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest text-xs shadow-2xl border-2 border-white">
              Sold Out
            </span>
          </div>
        )}

        {isDozen && !isSoldOut && (
          <div className="absolute top-2 right-3 bg-violet-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg animate-in zoom-in">
            Best Value
          </div>
        )}
      </div>

      {/* 📝 CONTENT SECTION */}
      <div className="p-4 flex flex-col flex-1 bg-white/80">

        <div className="mb-3 text-center min-h-[60px] flex flex-col justify-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-[1.1] italic">
            {flavorName}
          </h3>
          {/* ✅ Always show branding */}
          <p className="text-violet-600 text-xs font-black uppercase tracking-[0.3em] mt-1">
            Baked with Love
          </p>
        </div>

        {/* ↔️ TOGGLE SWITCH */}
        <div className="flex bg-violet-400/20 p-1 rounded-xl mb-1 relative border border-violet-400/30">
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

        {/* ✅ INVENTORY DISPLAY (Under Toggle) */}
        <div className="min-h-[20px] mb-4 text-center">
          {activeProduct.trackInventory && (
            <p className={`mt-2 text-xs font-black uppercase tracking-widest ${
              isSoldOut ? "text-red-600" : isLowStock ? "bg-yellow-100 p-1 border rounded-xl border-red-500 text-red-500 animate-pulse" : "text-stone-400"
            }`}>
              {isSoldOut 
                ? "SOLD OUT" 
                : isLowStock 
                  ? `🔥 Hurry! Only ${activeProduct.stockQuantity} Left!` 
                  : `In Stock: ${activeProduct.stockQuantity}`}
            </p>
          )}
        </div>

        {/* 💰 PRICE + ACTION */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <span className="text-xl font-black text-slate-900 tracking-tighter italic">
            ${activeProduct.price.toFixed(2)}
          </span>

          <button
            onClick={() => onAddToCart(activeProduct)}
            disabled={isSoldOut}
            className={`px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.1em] transition-all shadow-xl ${
              isSoldOut 
                ? "bg-slate-400 text-slate-200 cursor-not-allowed shadow-none" 
                : "bg-violet-600 text-white hover:bg-violet-700 active:scale-95 shadow-violet-400/20 hover:bg-violet-900   hover:border-blue-500 hover:shadow-violet-600 hover:shadow-md"
            }`}
          >
            {isSoldOut ? "Sold Out" : "+ Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}