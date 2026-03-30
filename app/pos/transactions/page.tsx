"use client";

import Link from "next/link";
import OrderHistory from "../components/OrderHistory";

/* -------------------------------------------------------
   🧾 POS Transactions Page
   Main interface for viewing the journal/order history.
------------------------------------------------------- */
export default function POSTransactionsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      
      {/* 📑 NAVIGATION TABS */}
      <div className="flex border-b border-gray-200">
        <Link 
          href="/pos" 
          className="px-6 py-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          Register
        </Link>
        <button 
          className="px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-bold"
        >
          Transactions
        </button>
      </div>

      {/* PAGE CONTENT */}
        <OrderHistory />

    </div>
  );
}