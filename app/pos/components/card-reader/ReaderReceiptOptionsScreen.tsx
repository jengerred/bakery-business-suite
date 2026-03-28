"use client";

import { useEffect } from "react";

/* -------------------------------------------------------
   🧾 Types
   Props describe:
   - Whether the customer has an account
   - Callback for chosen receipt method
   - Callback for timeout (no interaction)
------------------------------------------------------- */
type Props = {
  customerExists: boolean;
  onDone: (method: "print" | "email" | "text" | "none") => void;
  onTimeout: () => void;
};

/* -------------------------------------------------------
   🧱 ReaderReceiptOptionsScreen
   Customer-facing receipt selection screen.

   Responsibilities:
   - Show available receipt options
   - Auto-timeout after 10 seconds of inactivity
   - Notify parent which method was chosen
   - Support reduced options when no customer exists

   NOTE:
   - This screen is intentionally minimal to match real
     Stripe Terminal UX patterns.
------------------------------------------------------- */
export default function ReaderReceiptOptionsScreen({
  customerExists,
  onDone,
  onTimeout,
}: Props) {

  /* -------------------------------------------------------
     ⏱️ AUTO-TIMEOUT
     If the customer does nothing for 10 seconds:
     → Treat as "none"
     → Parent handles thank-you + reset flow
  ------------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onTimeout]);

  /* -------------------------------------------------------
     🎨 UI — Receipt Options
     Customer with account:
       - Print
       - Email
       - Text
       - None
     Guest customer:
       - Print
       - None
  ------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">

      <h2 className="text-xl font-semibold">Receipt Options</h2>

      {customerExists ? (
        /* ⭐ Full options for known customers */
        <div className="flex flex-col space-y-3 w-full px-6">
          <button
            onClick={() => onDone("print")}
            className="w-full py-2 bg-gray-800 text-white rounded"
          >
            Print Receipt
          </button>

          <button
            onClick={() => onDone("email")}
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Email Receipt
          </button>

          <button
            onClick={() => onDone("text")}
            className="w-full py-2 bg-green-600 text-white rounded"
          >
            Text Receipt
          </button>

          <button
            onClick={() => onDone("none")}
            className="w-full py-2 bg-gray-300 text-gray-700 rounded"
          >
            No Receipt
          </button>
        </div>
      ) : (
        /* ⭐ Guest customer → limited options */
        <div className="flex flex-col space-y-3 w-full px-6">
          <button
            onClick={() => onDone("print")}
            className="w-full py-2 bg-gray-800 text-white rounded"
          >
            Print Receipt
          </button>

          <button
            onClick={() => onDone("none")}
            className="w-full py-2 bg-gray-300 text-gray-700 rounded"
          >
            No Receipt
          </button>
        </div>
      )}
    </div>
  );
}
