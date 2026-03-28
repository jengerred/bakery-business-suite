"use client";

/* -------------------------------------------------------
   🧾 CustomerLookupModal (Cashier-Side)
   This modal is used ONLY on the cashier UI, not the reader.

   Responsibilities:
   - Allow cashier to look up a customer by phone/email
   - If found → return the User object
   - If not found → return the raw lookup value
   - Allow cashier to cancel and close the modal

   NOTE:
   - This is NOT part of the reader flow.
   - The reader has its own lookup screen.
------------------------------------------------------- */

import { useState } from "react";
import { userService } from "../../lib/userService";
import type { User } from "../../types/user";

/* -------------------------------------------------------
   🧱 Component
------------------------------------------------------- */
export default function CustomerLookupModal({
  onFound,
  onNotFound,
  onClose,
}: {
  onFound: (user: User) => void;      // Customer exists
  onNotFound: (value: string) => void; // Customer not found
  onClose: () => void;                // Close modal
}) {

  /* -------------------------------------------------------
     📝 Local Input State
  ------------------------------------------------------- */
  const [value, setValue] = useState("");

  /* -------------------------------------------------------
     🔍 Lookup Handler
     Searches for a customer by phone/email.
     - If found → return user
     - If not found → return lookup value
  ------------------------------------------------------- */
  const handleLookup = async () => {
    const found = await userService.find(value);

    if (found) {
      onFound(found);
    } else {
      onNotFound(value);
    }
  };

  /* -------------------------------------------------------
     🎨 UI — Modal Layout
  ------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">

        <h2 className="text-xl font-bold mb-4">Lookup Customer</h2>

        {/* Input */}
        <input
          className="border p-2 w-full mb-4"
          placeholder="Phone or Email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* Search */}
        <button
          className="bg-blue-600 text-white w-full py-2 rounded mb-3"
          onClick={handleLookup}
        >
          Search
        </button>

        {/* Cancel */}
        <button
          className="text-gray-600 underline w-full"
          onClick={onClose}
        >
          Cancel
        </button>

      </div>
    </div>
  );
}
