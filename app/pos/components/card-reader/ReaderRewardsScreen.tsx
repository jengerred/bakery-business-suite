"use client";

/* -------------------------------------------------------
   📦 React
------------------------------------------------------- */
import { useState } from "react";

/* -------------------------------------------------------
   🧱 ReaderRewardsScreen
   This is the reader's home/idle screen.

   Responsibilities:
   - Collect phone or email for rewards lookup
   - Allow customer to skip rewards entirely
   - Keep UI extremely simple and customer-friendly

   NOTE:
   - No validation beyond "non-empty" input
   - Parent handles lookup logic and screen transitions
------------------------------------------------------- */
export default function ReaderRewardsScreen({
  onSubmit,
  onSkip,
}: {
  onSubmit: (value: string) => void; // Customer entered phone/email
  onSkip: () => void;                // Customer chose to skip rewards
}) {


  
  /* -------------------------------------------------------
     📝 Local Input State
  ------------------------------------------------------- */
  const [value, setValue] = useState("");


  /* -------------------------------------------------------
     🎨 UI — Rewards Prompt
     Simple, centered layout optimized for small screens.
  ------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 text-center">

      <h2 className="text-xl font-bold mb-4">Rewards?</h2>

      <p className="text-sm text-gray-600 mb-4">
        Enter phone or email to earn points.
      </p>

      {/* Input */}
      <input
        className="border rounded px-3 py-2 w-full max-w-xs mb-4 text-center"
        placeholder="Phone or Email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Continue */}
      <button
        className="bg-blue-600 text-white w-full max-w-xs py-2 rounded mb-3 disabled:bg-gray-400"
        disabled={!value}
        onClick={() => onSubmit(value)}
      >
        Continue
      </button>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="text-gray-600 underline text-sm"
      >
        Skip
      </button>
    </div>
  );
}
