"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import LoginModal from "./LoginModal"; // Ensure this path matches where you saved the modal

interface ShopNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function ShopNavbar({ cartCount, onOpenCart }: ShopNavbarProps) {
  const { user, logout } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-3 flex justify-between items-center">
        {/* Brand Logo Section */}
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
        
      {/* User Auth Section - Clean & Personal */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-sm text-stone-500 uppercase font-black tracking-[0.2em] mb-0.5"> 
                  Welcome Back
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-violet-800 uppercase tracking-wider italic">
                   ~ {user.name} ~
                  </span>
                </div>
                  <button 
                    onClick={logout}
                    className="text-[9px] bg-stone-100 text-stone-400 px-2 py-1 mt-2 rounded-md border border-red-300 hover:text-red-500 hover:bg-red-50 uppercase font-black tracking-widest transition-all"
                  > 
                    Logout
                  </button>
                  
                
              </div>
            ) : ( 
              <div className="hidden md:block">
                <span className="text-xs text-violet-600 uppercase font-bold tracking-[0.3em]">
                 Welcome to the bakery!
                </span>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button 
            onClick={onOpenCart} 
            className="relative p-3 text-2xl hover:scale-110 transition-transform active:scale-95 bg-stone-50 rounded-2xl border border-stone-100 shadow-sm"
          >
            <span className="filter drop-shadow-sm">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </button>
      </nav>

      {/* Auth Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
}