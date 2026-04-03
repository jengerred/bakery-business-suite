"use client";

import Link from "next/link";

interface ShopNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function ShopNavbar({ cartCount, onOpenCart }: ShopNavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-3 flex justify-between items-center">
      <Link href="/shop" className="group flex flex-col items-start transition-opacity hover:opacity-80">
        <span className="text-[10px] font-bold text-stone-900 leading-none uppercase tracking-tight">
          Veronica Bowens
        </span>
        <span className="italic text-violet-600 text-lg font-black uppercase tracking-tighter leading-none my-0.5">
          Mothers Secret Recipe
        </span>
        <span className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-black leading-none">
          Bakery
        </span>
      </Link>
      
      <button 
        onClick={onOpenCart} 
        className="relative p-3 text-2xl hover:scale-110 transition-transform active:scale-95 bg-stone-50 rounded-2xl border border-stone-100"
      >
        <span className="filter drop-shadow-sm">🛒</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md animate-in zoom-in duration-300">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}