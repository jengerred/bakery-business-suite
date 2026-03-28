"use client";

/* -------------------------------------------------------
   ⚠️ NOTE: This component is NOT currently integrated.
   It is reserved for future use when we simulate a
   Stripe Terminal PIN entry flow (e.g., debit cards).

   Keeping it now avoids re‑building it later and makes
   the POS architecture future‑proof.
------------------------------------------------------- */

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   🧾 Types
------------------------------------------------------- */
type Props = {
  onSubmit: (pin: string) => void; // Called when a valid 4‑digit PIN is entered
};

/* -------------------------------------------------------
   🧱 StripePinPad
   A standalone PIN pad UI component.

   Responsibilities:
   - Display 4 PIN dots (filled as user types)
   - Provide a 0–9 keypad
   - Provide Clear + Enter actions
   - Only allow 4 digits
   - Call onSubmit(pin) when Enter is pressed with 4 digits

   NOTE:
   - This mimics the PIN entry flow on real Stripe hardware.
   - Not currently used, but ready for future integration.
------------------------------------------------------- */
export default function StripePinPad({ onSubmit }: Props) {

  /* -------------------------------------------------------
     🔢 PIN State
  ------------------------------------------------------- */
  const [pin, setPin] = useState("");

  /* -------------------------------------------------------
     🔘 Digit Press
     Appends a digit until 4 digits are reached.
  ------------------------------------------------------- */
  const handlePress = (digit: string) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
  };

  /* -------------------------------------------------------
     🧹 Clear PIN
  ------------------------------------------------------- */
  const handleClear = () => setPin("");

  /* -------------------------------------------------------
     ✔️ Submit PIN
     Only valid when exactly 4 digits are entered.
  ------------------------------------------------------- */
  const handleEnter = () => {
    if (pin.length === 4) onSubmit(pin);
  };

  /* -------------------------------------------------------
     🎨 UI — PIN Pad Layout
  ------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center space-y-4">

      {/* PIN dots */}
      <div className="flex space-x-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border border-gray-400 ${
              pin.length > i ? "bg-gray-700" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-3 text-lg font-semibold">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handlePress(String(n))}
            className="w-16 h-16 bg-white border rounded shadow-sm hover:bg-gray-100"
          >
            {n}
          </button>
        ))}

        {/* Empty placeholder */}
        <div />

        {/* Zero */}
        <button
          onClick={() => handlePress("0")}
          className="w-16 h-16 bg-white border rounded shadow-sm hover:bg-gray-100"
        >
          0
        </button>

        {/* Empty placeholder */}
        <div />
      </div>

      {/* Clear + Enter */}
      <div className="flex space-x-4 mt-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Clear
        </button>

        <button
          onClick={handleEnter}
          disabled={pin.length !== 4}
          className={`px-4 py-2 rounded text-white ${
            pin.length === 4
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400"
          }`}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
