"use client";

/* -------------------------------------------------------
   🧾 QuickCreateCustomerModal (Cashier-Side)
   This modal is used ONLY on the cashier UI, not the reader.

   Responsibilities:
   - Allow cashier to quickly create a lightweight customer
     record when a lookup fails
   - Accept:
       • First name (optional)
       • Phone OR email (required)
   - Automatically detect whether the value is phone/email
   - Return the newly created User object to the parent
   - Allow cashier to cancel and close the modal

   NOTE:
   - The reader has its own Quick Signup screen.
   - This modal is specifically for cashier-driven flows.
------------------------------------------------------- */

import { useState } from "react";
import { userService } from "../../lib/userService";
import type { User } from "../../../types/user";

/* -------------------------------------------------------
   🧱 Component
------------------------------------------------------- */
export default function QuickCreateCustomerModal({
  initialValue,
  onCreate,
  onClose,
}: {
  initialValue: string;             // Pre-filled phone/email from lookup
  onCreate: (user: User) => void;   // Return newly created user
  onClose: () => void;              // Close modal
}) {

  /* -------------------------------------------------------
     📝 Local Form State
  ------------------------------------------------------- */
  const [name, setName] = useState("");
  const [value, setValue] = useState(initialValue);

  /* -------------------------------------------------------
     ➕ CREATE USER
     Builds a minimal user object:
     - name
     - phone OR email (auto-detected)
     Then returns it to the parent.
  ------------------------------------------------------- */
  const handleCreate = async () => {
    const newUser = await userService.create({
      name,
      phone: value.includes("@") ? undefined : value,
      email: value.includes("@") ? value : undefined,
    });

    onCreate(newUser);
  };

  /* -------------------------------------------------------
     🎨 UI — Modal Layout
  ------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">

        <h2 className="text-xl font-bold mb-4">Quick Sign Up</h2>

        {/* Name (optional) */}
        <input
          className="border p-2 w-full mb-3"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Phone or Email */}
        <input
          className="border p-2 w-full mb-3"
          placeholder="Phone or Email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* Create */}
        <button
          className="bg-green-600 text-white w-full py-2 rounded mb-3"
          onClick={handleCreate}
        >
          Create Account
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
