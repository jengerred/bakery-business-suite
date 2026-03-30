"use client";

import { useEffect } from "react";

/* -------------------------------------------------------
   🧾 Types
------------------------------------------------------- */
type Props = {
  customerExists: boolean;
  onDone: (method: "print" | "email" | "text" | "none") => void;
  onTimeout: () => void;
};

/* -------------------------------------------------------
   🧱 ReaderReceiptOptionsScreen
   Customer-facing receipt selection screen.
------------------------------------------------------- */
export default function ReaderReceiptOptionsScreen({
  customerExists,
  onDone,
  onTimeout,
}: Props) {

  /* -------------------------------------------------------
     ⏱️ SNAPPY AUTO-ADVANCE
     Reduced from 10 seconds to 2.5 seconds.
     🛠️ FIX: We now call onDone("print") instead of onTimeout.
     This ensures the cashier's Print button is enabled by default
     if the customer walks away without choosing.
  ------------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Default to "print" mode so cashier can handle it
      onDone("print"); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 bg-white p-4">

      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
        Receipt Options
      </h2>

      <div className="flex flex-col space-y-3 w-full px-4">
        {/* ⭐ PRIMARY OPTION */}
        <button
          onClick={() => onDone("print")}
          className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          Print Receipt
        </button>

        {customerExists && (
          <>
            <button
              onClick={() => onDone("email")}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              Email Receipt
            </button>

            <button
              onClick={() => onDone("text")}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              Text Receipt
            </button>
          </>
        )}

        {/* ⭐ DECLINE OPTION */}
        <button
          onClick={() => onDone("none")}
          className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
        >
          No Receipt
        </button>
      </div>

      {/* ⏳ Snappy Status Hint */}
      <p className="text-[10px] text-slate-400 uppercase tracking-widest animate-pulse font-bold">
        Auto-printing in 2s...
      </p>
    </div>
  );
}