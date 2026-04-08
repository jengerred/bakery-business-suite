"use client";

import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  taxable?: boolean;
  imageUrl?: string; // ⭐ Add this so images work
};

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

  // ⭐ This is the product we should use for image + price
  const activeProduct = isDozen ? dozenProduct : singleProduct;

  const isCookie = flavorName.toLowerCase().includes("cookie");
  const savings = Math.round(
    (1 - dozenProduct.price / (singleProduct.price * 12)) * 100
  );

  return (
    <div className="group relative flex flex-col bg-violet-400/50 border-2 border-violet-400 rounded-[2rem] overflow-hidden transition-all duration-500 
    hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-[0_0_40px_8px_rgba(167,139,250,0.6)]">
      
      {/* 🖼️ IMAGE SECTION */}
      <div className="h-50 relative flex items-center justify-center text-5xl group-hover:bg-violet-300 transition-colors duration-500">
        <img
          src={activeProduct.imageUrl}   // ⭐ FIXED
          alt={activeProduct.name}       // ⭐ FIXED
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {isDozen && (
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
          <p className="text-violet-600 text-[8px] font-black uppercase tracking-[0.3em] mt-1">
            Baked with Love
          </p>
        </div>

        {/* ↔️ TOGGLE SWITCH */}
        <div className="flex bg-violet-400/20 p-1 rounded-xl mb-4 relative border border-violet-400/30">
          <button
            onClick={() => setIsDozen(false)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
              !isDozen
                ? "bg-white shadow-md text-violet-600 scale-[1.02]"
                : "text-violet-900/50 hover:text-violet-900"
            }`}
          >
            SINGLE
          </button>

          <button
            onClick={() => setIsDozen(true)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all relative ${
              isDozen
                ? "bg-white shadow-md text-violet-600 scale-[1.02]"
                : "text-violet-900/50 hover:text-violet-900"
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

        {/* 💰 PRICE + ACTION */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <span className="text-xl font-black text-slate-900 tracking-tighter italic">
            ${activeProduct.price.toFixed(2)}
          </span>

          <button
            onClick={() => onAddToCart(activeProduct)}
            className="px-4 py-3 bg-violet-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] hover:bg-violet-700 active:scale-95 transition-all shadow-xl shadow-violet-400/20"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}
