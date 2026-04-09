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
   - Fetches products from backend
   - Sorts by sort_order
   - Groups Single + Dozen pairs
   - Renders POSFlavorCard for each flavor
   --------------------------------------------------------- */
export default function ProductList({ onAdd }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);

  /* -----------------------------
     Fetch products from backend
     ----------------------------- */
  useEffect(() => {
    async function loadProducts() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    }
    loadProducts();
  }, []);

  /* -----------------------------
     Loading state
     ----------------------------- */
  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-violet-600 font-black">
        Loading products…
      </div>
    );
  }

  /* -----------------------------
     Sort products by sort_order
     ----------------------------- */
  const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);

  /* -----------------------------
     Group products into:
     {
       flavorName: "Chocolate Chip Cookie",
       singleProduct: {...},
       dozenProduct: {...}
     }
     ----------------------------- */
  const groupedFlavors = (() => {
    const map = new Map<string, { single?: Product; dozen?: Product }>();

    sorted.forEach((p) => {
      const baseName = p.name
        .replace(" - Single", "")
        .replace(" - Dozen", "");

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

  /* -----------------------------
     Render POS flavor cards
     ----------------------------- */
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
   - Shows image
   - Toggle Single/Dozen
   - Shows price + savings
   - Add to Order button
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

  /* -----------------------------
     Active product (Single or Dozen)
     ----------------------------- */
  const activeProduct = isDozen ? dozen : single;

  /* -----------------------------
     Savings badge calculation
     ----------------------------- */
  const savings = Math.round(
    (1 - dozen.price / (single.price * 12)) * 100
  );

  /* -----------------------------
     UI
     ----------------------------- */
  return (
    <div className="group relative flex flex-col bg-violet-300/90 border-2 border-violet-400 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-[0_0_40px_8px_rgba(167,139,250,0.6)]">

      {/* -------------------------
         Product Image
         ------------------------- */}
      <div className="h-32 relative flex items-center justify-center overflow-hidden group-hover:bg-violet-300 transition-colors duration-500">
        <img
          src={activeProduct.imageUrl}
          alt={activeProduct.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {isDozen && (
          <div className="absolute top-2 right-3 bg-violet-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg animate-in zoom-in">
            Best Value
          </div>
        )}
      </div>

      {/* -------------------------
         Content
         ------------------------- */}
      <div className="p-4 flex flex-col flex-1 bg-white/80">
        <div className="mb-3 text-center min-h-[60px] flex flex-col justify-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-[1.1] italic">
            {flavor}
          </h3>
          <p className="text-violet-600 text-[8px] font-black uppercase tracking-[0.3em] mt-1">
            Mother's Secret Recipe
          </p>
        </div>

        {/* -------------------------
           Toggle Single / Dozen
           ------------------------- */}
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

        {/* -------------------------
           Price + Add to Order
           ------------------------- */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <span className="text-xl font-black text-slate-900 tracking-tighter italic">
            ${activeProduct.price.toFixed(2)}
          </span>

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
