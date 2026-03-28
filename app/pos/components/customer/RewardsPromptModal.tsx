"use client";

/* -------------------------------------------------------
   🧾 RewardsPromptModal (Cashier-Side)
   This modal appears ONLY on the cashier UI, not the reader.

   Responsibilities:
   - Ask the cashier whether the customer wants rewards
   - Provide three paths:
       • Look up an existing account
       • Create a quick account
       • Continue as guest
   - Close itself after any selection

   NOTE:
   - The reader has its own Rewards screen.
   - This modal is part of the cashier-driven flow.
------------------------------------------------------- */

import { useState } from "react";

/* -------------------------------------------------------
   🧱 Component
------------------------------------------------------- */
export default function RewardsPromptModal({
  onLookup,
  onCreate,
  onGuest,
}: {
  onLookup: () => void; // Customer wants to look up an account
  onCreate: () => void; // Customer wants to sign up quickly
  onGuest: () => void;  // Customer wants to skip rewards
}) {

  /* -------------------------------------------------------
     🎨 UI — Modal Layout
  ------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">

        <h2 className="text-xl font-bold mb-4">Earn Rewards Today?</h2>

        {/* Lookup existing account */}
        <button
          className="bg-blue-600 text-white w-full py-2 rounded mb-3"
          onClick={onLookup}
        >
          Look up account
        </button>

        {/* Quick signup */}
        <button
          className="bg-green-600 text-white w-full py-2 rounded mb-3"
          onClick={onCreate}
        >
          Sign up quickly
        </button>

        {/* Guest checkout */}
        <button
          className="text-gray-600 underline w-full"
          onClick={onGuest}
        >
          No thanks (Guest)
        </button>

      </div>
    </div>
  );
}
