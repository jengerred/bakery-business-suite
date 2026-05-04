"use client";

/* ---------------------------------------------------------
   Imports
   --------------------------------------------------------- */
import { useEffect, useState } from "react";
import { Product } from "@/app/types/product";

/* ---------------------------------------------------------
   Types
   --------------------------------------------------------- */
type ProductListProps = {
  onAdd: (product: Product, quantity: number, price?: number) => void;
};

/* ---------------------------------------------------------
   POS PRODUCT LIST (Main Component)
   --------------------------------------------------------- */
export default function ProductList({ onAdd }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    }
    loadProducts();
  }, []); // Empty dependency array to fix the "change size" render error

  if (products.length === 0) {
    return <div className="p-4 text-center text-violet-600 font-black">Loading products…</div>;
  }

  const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
      {groupedFlavors.map(({ flavorName, singleProduct, dozenProduct }) => {
        if (!singleProduct || !dozenProduct) return null;
        return (
          <POSFlavorCard
            key={flavorName}
            flavor={flavorName}
            single={singleProduct}
            dozen={dozenProduct}
            onAdd={onAdd}
          />
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   POS FLAVOR CARD
   --------------------------------------------------------- */
function POSFlavorCard({
  flavor,
  single,
  dozen,
  onAdd,
}: {
  flavor: string;
  single: Product;
  dozen: Product;
  onAdd: (product: Product, quantity: number, price?: number) => void;
}) {
  const [isDozen, setIsDozen] = useState(false);
  const activeProduct = isDozen ? dozen : single;

  const isSoldOut =
    activeProduct.trackInventory === true &&
    (activeProduct.stockQuantity ?? 0) <= 0;

  const isLowStock =
    activeProduct.trackInventory === true &&
    (activeProduct.stockQuantity ?? 0) > 0 &&
    (activeProduct.stockQuantity ?? 0) <= 5;
    
  const savings = Math.round((1 - dozen.price / (single.price * 12)) * 100);

  return (
    <div className={`group relative flex flex-col bg-violet-300/90 border-2 border-violet-400 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-[0_0_40px_8px_rgba(167,139,250,0.6)] ${isSoldOut ? 'grayscale-[0.5] opacity-80' : ''}`}>

      {/* 🖼️ IMAGE SECTION */}
      <div className="h-32 relative flex items-center justify-center overflow-hidden group-hover:bg-violet-300 transition-colors duration-500">
        <img
          src={activeProduct.imageUrl}
          alt={activeProduct.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

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
    <div className="mb-3 text-center min-h-[65px] flex flex-col justify-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-[1.1] italic">
            {flavor}
          </h3>
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

        {/* ✅ INVENTORY DISPLAY (Under Toggle - Matches Shop Spacing) */}
        <div className="min-h-[20px] mb-4 text-center">
          {activeProduct.trackInventory && (
            <p className={`mt-2 p-1 text-xs font-bold uppercase tracking-widest transition-colors ${
              isSoldOut ? "text-red-600" : isLowStock ? "text-red-500 animate-pulse bg-yellow-100/80 border rounded-md border-red-500" : "text-stone-500"
            }`}>
              {isSoldOut 
                ? "SOLD OUT" 
                : isLowStock 
                  ? `⚠️ Only ${activeProduct.stockQuantity} Left!` 
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
            disabled={isSoldOut}
            onClick={() => onAdd(activeProduct, 1)}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-sm tracking-[0.1em] transition-all shadow-xl ${
              isSoldOut 
                ? 'bg-slate-400 text-slate-200 cursor-not-allowed shadow-none' 
                : 'bg-violet-600 text-white font-black active:scale-95 shadow-violet-400/20  hover:bg-violet-900 hover:border-blue-500 hover:shadow-violet-600 hover:shadow-md'
            }`}
          >
            {isSoldOut ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}