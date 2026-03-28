"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   👤 User Service + Types
   userService.create() stores a new user in local storage.
------------------------------------------------------- */
import { userService } from "../../lib/userService";
import type { User } from "../../types/user";

/* -------------------------------------------------------
   🧱 ReaderQuickSignupScreen
   Customer-facing quick signup screen shown when:
   - Customer enters a phone/email that does not exist
   - Reader needs a minimal account to attach the order

   Responsibilities:
   - Collect first name
   - Collect phone OR email
   - Create a lightweight user record
   - Return the new user to the parent component

   NOTE:
   - This is intentionally minimal to match real POS flows.
   - No validation beyond "non-empty" fields.
------------------------------------------------------- */
export default function ReaderQuickSignupScreen({
  initialValue,
  onCreate,
  onBack,
}: {
  initialValue: string;              // Pre-filled phone/email from Rewards screen
  onCreate: (user: User) => void;    // Return newly created user
  onBack: () => void;                // Return to Rewards screen
}) {

  /* -------------------------------------------------------
     📝 Local Form State
  ------------------------------------------------------- */
  const [name, setName] = useState("");
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     🧩 CREATE USER
     Builds a minimal user object:
     - name
     - phone OR email (auto-detected)
     Then returns it to the parent.
  ------------------------------------------------------- */
  const handleCreate = async () => {
    setLoading(true);

    const newUser: User = await userService.create({
      name,
      phone: value.includes("@") ? undefined : value,
      email: value.includes("@") ? value : undefined,
    });

    setLoading(false);
    onCreate(newUser);
  };

  /* -------------------------------------------------------
     🎨 UI — Simple signup form
  ------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 text-center">

      <h2 className="text-xl font-semibold mb-4">Quick Sign Up</h2>

      {/* First Name */}
      <input
        className="border rounded px-3 py-2 w-full max-w-xs mb-3 text-center"
        placeholder="First Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Phone or Email */}
      <input
        className="border rounded px-3 py-2 w-full max-w-xs mb-4 text-center"
        placeholder="Phone or Email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={!name || !value || loading}
        className="bg-green-600 text-white w-full max-w-xs py-2 rounded mb-3 disabled:bg-gray-400"
      >
        {loading ? "Creating…" : "Create Account"}
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        className="text-gray-600 underline text-sm"
      >
        Back
      </button>
    </div>
  );
}
