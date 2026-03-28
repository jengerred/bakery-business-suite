"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useEffect } from "react";

/* -------------------------------------------------------
   👤 User Service + Types
   userService.find() searches local user storage by
   phone or email. If a match is found, we return a User.
------------------------------------------------------- */
import { userService } from "../../lib/userService";
import type { User } from "../../types/user";

/* -------------------------------------------------------
   🧱 ReaderCustomerLookupScreen
   This screen appears on the customer-facing reader
   immediately after the customer enters their phone/email.

   Responsibilities:
   - Automatically search for an existing customer
   - If found → notify parent via onFound(user)
   - If not found → notify parent via onNotFound(value)
   - Show a simple "Searching…" UI while lookup runs
   - Allow customer to go back to Rewards screen

   NOTE:
   - The lookup runs automatically unless auto={false}
   - Cleanup prevents state updates if component unmounts
------------------------------------------------------- */
export default function ReaderCustomerLookupScreen({
  value,
  onFound,
  onNotFound,
  onBack,
  auto = true,
}: {
  value: string;                     // Phone or email entered by customer
  onFound: (user: User) => void;     // Callback when user exists
  onNotFound: (value: string) => void; // Callback when no match found
  onBack: () => void;                // Return to Rewards screen
  auto?: boolean;                    // Disable auto-lookup (rare)
}) {

  /* -------------------------------------------------------
     🔍 AUTO-LOOKUP EFFECT
     Runs once on mount (or when value changes).

     Steps:
     1. If auto=false → do nothing
     2. Call userService.find(value)
     3. If found → onFound(user)
     4. If not found → onNotFound(value)
     5. Cleanup prevents callback firing after unmount
  ------------------------------------------------------- */
  useEffect(() => {
    if (!auto) return;

    let cancelled = false;

    async function lookup() {
      const found = await userService.find(value);
      if (cancelled) return;

      if (found) onFound(found);
      else onNotFound(value);
    }

    lookup();

    return () => {
      cancelled = true; // Prevents state updates after unmount
    };
  }, [value, auto, onFound, onNotFound]);

  /* -------------------------------------------------------
     🎨 UI — Simple loading screen
     Shows:
     - "Looking up account…"
     - The value being searched
     - A pulsing "Searching…" indicator
     - A Back button to return to Rewards
  ------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 text-center">

      <h2 className="text-xl font-semibold mb-2">Looking up account…</h2>

      <p className="text-gray-600 text-sm mb-4">{value}</p>

      <div className="animate-pulse text-gray-500 mb-6">Searching…</div>

      <button
        onClick={onBack}
        className="text-gray-600 underline text-sm"
      >
        Back
      </button>
    </div>
  );
}
