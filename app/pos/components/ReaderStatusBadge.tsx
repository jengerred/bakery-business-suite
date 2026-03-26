"use client";

/* -------------------------------------------------------
   🏷️ Props
   Accepts the current terminal status string.
------------------------------------------------------- */
type Props = {
  status: string;
};

/* -------------------------------------------------------
   🔌 ReaderStatusBadge
   Displays a small colored badge showing the simulated
   card reader’s current status (connected, collecting, etc).
------------------------------------------------------- */
export default function ReaderStatusBadge({ status }: Props) {
  /* ------------------------------
     🎨 Color Styles
     Background + text color based on status.
  ------------------------------ */
  const color =
    status === "connected"
      ? "bg-green-100 text-green-700"
      : status === "connecting"
      ? "bg-yellow-100 text-yellow-700"
      : status === "collecting"
      ? "bg-blue-100 text-blue-700"
      : status === "succeeded"
      ? "bg-green-200 text-green-800"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-gray-200 text-gray-600"; // default (disconnected, waiting, unknown)

  /* ------------------------------
     🏷️ Human‑Readable Label
     Converts internal status → UI text.
  ------------------------------ */
  const label =
    status === "disconnected"
      ? "Reader Disconnected"
      : status === "connecting"
      ? "Reader Connecting…"
      : status === "connected"
      ? "Reader Connected"
      : status === "waiting"
      ? "Waiting for Customer…"
      : status === "collecting"
      ? "Processing Payment…"
      : status === "succeeded"
      ? "Payment Complete"
      : status === "failed"
      ? "Reader Error"
      : "";

  /* ------------------------------
     🎨 Render Badge
  ------------------------------ */
  return (
    <div className="flex justify-end mb-4">
      <span className={`px-3 py-1 rounded text-sm ${color}`}>
        {label}
      </span>
    </div>
  );
}
