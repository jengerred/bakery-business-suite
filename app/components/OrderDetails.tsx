"use client";

import { ManagerOrder } from "../types/order";

export default function OrderDetails({ order }: { order: ManagerOrder }) {
  const pickupTimestamp = order.pickupTime
    ? new Date(order.pickupTime)
    : null;

  return (
    <div className="mt-4 space-y-4 text-xs text-stone-600">

      {/* ORDER INFO */}
      <div className="bg-stone-100 p-4 border-2 rounded-2xl border-orange-300">
        <h4 className="font-black text-orange-800 text-[10px] uppercase tracking-widest mb-1">
          Order Info:
        </h4>

        <p><span className="font-bold">Full Order ID:</span> {order.id}</p>

        <p>
          <span className="font-bold">Placed:</span>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ITEMS */}
      <div className="bg-stone-100 p-4 rounded-2xl border-2 border-violet-300">
        <h4 className="font-black text-violet-800 text-[10px] uppercase tracking-widest mb-1">
          Items:
        </h4>

        {order.items?.map((item, i) => (
          <p key={i}>
            {item.quantity}× {item.product?.name} — $
            {(item.product?.price * item.quantity).toFixed(2)}
          </p>
        ))}
      </div>

      {/* CUSTOMER */}
      <div className="bg-stone-100 p-4 rounded-2xl border-2 border-blue-300">
        <h4 className="font-black text-blue-800 text-[10px] uppercase tracking-widest mb-1">
          Customer Details:
        </h4>

        <p><span className="font-bold">Email:</span> {order.customerEmail || "N/A"}</p>
        <p><span className="font-bold">Phone:</span> {order.customerPhone || "N/A"}</p>
      </div>

      {/* PAYMENT */}
      <div className="bg-stone-100 p-4 rounded-2xl border-2 border-green-300">
        <h4 className="font-black text-green-800 text-[10px] uppercase tracking-widest mb-1">
          Payment Details:
        </h4>

        <p><span className="font-bold">Status:</span> {order.status}</p>
        <p><span className="font-bold">Subtotal:</span> ${order.subtotal?.toFixed(2)}</p>
        <p><span className="font-bold">Tax:</span> ${order.tax?.toFixed(2)}</p>
        <p><span className="font-bold">Tendered:</span> ${order.cashTendered?.toFixed(2) || ""}</p>
        <p><span className="font-bold">Change:</span> ${order.changeGiven?.toFixed(2) || ""}</p>
        <p><span className="font-bold">Type:</span> {order.paymentType}</p>
        <p><span className="font-bold">Method:</span> {order.cardEntryMethod || ""}</p>
      </div>

      {/* PICKUP TIME */}
      {pickupTimestamp && (
        <div className="bg-stone-100 p-4 rounded-2xl border-2 border-stone-300">
          <h4 className="font-black text-stone-800 text-[10px] uppercase tracking-widest mb-1">
            Pickup
          </h4>

          <p>
            <span className="font-bold">Picked Up At:</span>{" "}
            {pickupTimestamp.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
