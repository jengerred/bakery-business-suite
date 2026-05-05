"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

type POSNavProps = {
  active: "register" | "pickup" | "transactions" | "kitchen" | "employee";
};

export default function POSNav({ active }: POSNavProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const baseBtn =
    "px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/50";

  const inactive =
    "bg-violet-100/40 hover:bg-violet-600 hover:text-white text-violet-700";

  const activeTab =
  "bg-violet-600 text-white shadow-md font-black border-2 !border-green-500 !shadow-[0_0_12px_3px_rgba(34,197,94,0.8)]";




  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-4 z-0">

      {/* LEFT SIDE */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">

        {/* MOBILE MENU BUTTON */}
        <button
          className="sm:hidden px-4 py-2 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          Menu
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden sm:flex gap-3 p-1.5 bg-violet-500/50 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">

          {/* REGISTER */}
          <Link
            href="/pos"
            className={`${baseBtn} ${
              active === "register" ? activeTab : inactive
            } flex items-center gap-3`}
          >
            {active === "register" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              </span>
            )}
            Register
          </Link>

          {/* PICKUP */}
          <Link
            href="/pos/pickup"
            className={`${baseBtn} ${
              active === "pickup" ? activeTab : inactive
            }`}
          >
            Pickup Orders
          </Link>

          {/* TRANSACTIONS */}
          <Link
            href="/pos/transactions"
            className={`${baseBtn} ${
              active === "transactions" ? activeTab : inactive
            }`}
          >
            Transactions
          </Link>

        {/* Kitchen (fulfillment) */}
          <Link
            href="/pos/kitchen"
            className={`${baseBtn} ${
              active === "kitchen" ? activeTab : inactive
            }`}
          >
            Kitchen
          </Link>

          {/* EMPLOYEE */}
          <Link
            href="/pos/employee"
            className={`${baseBtn} ${
              active === "employee" ? activeTab : inactive
            }`}
          >
            Employee
          </Link>
        </div>
      </div>

      {/* EXIT BUTTON */}
      <button
        onClick={() => setIsLogoutOpen(true)}
        className="group flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-600 transition-all active:scale-90"
      >
        Exit
      </button>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => setIsLogoutOpen(false)}
      />
    </div>
  );
}
