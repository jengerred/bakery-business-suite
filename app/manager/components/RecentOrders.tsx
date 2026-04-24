"use client";

import { useEffect, useRef, useState } from "react";
import type { ManagerOrder } from "./types";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RecentOrders({ todayOrders }: { todayOrders: ManagerOrder[] }) {
  const router = useRouter();

  /* -------------------------------------------------------
     STATE
  -------------------------------------------------------- */
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [open, setOpen] = useState({
    unfilled: true,
    POS: true,
    pickup: true,
    shipping: true,
    delivery: true,
  });

  const [unfilledOrders, setUnfilledOrders] = useState<ManagerOrder[]>([]);
  const previousUnfilledRef = useRef<any[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  /* -------------------------------------------------------
     AUTO‑REFRESH UNFILLED ORDERS
  -------------------------------------------------------- */
  const loadUnfilled = async (isPolling = false) => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();

      const unfilled = data.filter((o: ManagerOrder) => {
        if (o.fulfillmentType === "pickup") return !o.pickupTime;
        if (o.fulfillmentType === "shipping") return !o.fulfilledAt;
        if (o.fulfillmentType === "delivery") return !o.fulfilledAt;
        return false;
      });

      const oldJson = JSON.stringify(previousUnfilledRef.current);
      const newJson = JSON.stringify(unfilled);

      if (oldJson !== newJson) {
        setUnfilledOrders(unfilled);
        previousUnfilledRef.current = unfilled;
      }
    } catch (err) {
      console.error("Unfilled orders load error:", err);
    } finally {
      if (!isPolling) setInitialLoad(false);
    }
  };

  useEffect(() => {
    loadUnfilled(false);
    const interval = setInterval(() => loadUnfilled(true), 3000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     SORTED ORDERS FOR OTHER CATEGORIES
  -------------------------------------------------------- */
  const sorted = [...todayOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups = {
    POS: sorted.filter((o) => o.fulfillmentType === "POS"),
    pickup: sorted.filter((o) => o.fulfillmentType === "pickup"),
    shipping: sorted.filter((o) => o.fulfillmentType === "shipping"),
    delivery: sorted.filter((o) => o.fulfillmentType === "delivery"),
  };

  /* -------------------------------------------------------
     CATEGORY COLORS
  -------------------------------------------------------- */
  const COLORS = {
    unfilled: {
      border: "border-red-600",
      bg: "bg-yellow-100",
      text: "text-red-800",
    },
    POS: {
      border: "border-blue-600",
      bg: "bg-blue-100/40",
      text: "text-blue-800",
    },
    pickup: {
      border: "border-purple-600",
      bg: "bg-purple-100/40",
      text: "text-purple-800",
    },
    shipping: {
      border: "border-orange-500",
      bg: "bg-orange-100/40",
      text: "text-orange-600",
    },
    delivery: {
      border: "border-teal-600",
      bg: "bg-teal-100/40",
      text: "text-teal-800",
    },
  };

  /* -------------------------------------------------------
     CARD HELPERS
  -------------------------------------------------------- */
  const getStatusDot = (o: ManagerOrder) => {
    if (o.status !== "paid") return "bg-red-500 border-red-800";
    if (o.fulfillmentType === "pickup" && !o.pickupTime) return "bg-yellow-400 border-yellow-700";
    return "bg-green-500 border-green-800";
  };

  const getFulfillmentLabel = (type: string) =>
    ({
      POS: "POS: In‑Person",
      pickup: "Pickup Order",
      shipping: "Shipping Order",
      delivery: "Courier Delivery",
    }[type] || "Unknown");

  const getFulfillmentColor = (type: string) =>
    ({
      POS: "text-blue-700",
      pickup: "text-purple-700",
      shipping: "text-orange-700",
      delivery: "text-teal-700",
    }[type] || "text-gray-700");

  const getFulfillmentStatus = (o: ManagerOrder) => {
    if (o.fulfillmentType === "pickup") {
      return o.pickupTime
        ? { text: `Picked up at ${new Date(o.pickupTime).toLocaleString()}`, color: "text-green-700" }
        : { text: "Not yet picked up", color: "text-red-600" };
    }
    if (o.fulfillmentType === "shipping")
      return { text: "Not yet shipped", color: "text-red-600" };
    if (o.fulfillmentType === "delivery")
      return { text: "Not yet delivered", color: "text-red-600" };
    return { text: "Completed in‑store", color: "text-green-700" };
  };

  /* -------------------------------------------------------
     CARD COMPONENT
  -------------------------------------------------------- */
  const Card = (o: ManagerOrder) => {
    const expanded = expandedOrder === o.id;
    const fulfillment = getFulfillmentStatus(o);

    return (
      <div
        key={o.id}
        className="min-w-[280px] bg-white border border-slate-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full border-2 ${getStatusDot(o)}`}></span>
            <h3 className="text-lg font-black uppercase text-slate-900 leading-none">
              {o.customerName || "GUEST"}
            </h3>
          </div>

          <span className="text-sm font-black text-violet-600">
            #{o.id.slice(-4).toUpperCase()}
          </span>
        </div>

        {/* TIMESTAMP + TOTAL */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-bold uppercase text-stone-500">
            {new Date(o.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <p
            className={`text-lg font-black ${
              o.status === "paid" ? "text-slate-800" : "text-red-600"
            }`}
          >
            ${o.total.toFixed(2)}
          </p>
        </div>

        {/* ITEMS PREVIEW */}
        <div className="mb-4 -mt-2">
          {o.items.slice(0, 3).map((item, i) => (
            <p key={i} className="text-sm font-bold text-stone-700 truncate">
              <span className="text-violet-600">{item.quantity}×</span>{" "}
              {item.product?.name}
            </p>
          ))}

          {o.items.length > 3 && (
            <p className="text-xs text-stone-500 mt-1">
              +{o.items.length - 3} more…
            </p>
          )}
        </div>

        {/* FULFILLMENT LABEL */}
        <p
          className={`text-xs font-black uppercase tracking-widest ${getFulfillmentColor(
            o.fulfillmentType
          )}`}
        >
          {getFulfillmentLabel(o.fulfillmentType)}
        </p>

        <p className={`text-[11px] mt-1 ${fulfillment.color}`}>
          {fulfillment.text}
        </p>

        {/* EXPANDED DETAILS */}
        {expanded && (
          <div className="mt-4 space-y-4 text-xs text-stone-600">
            {/* ORDER INFO */}
            <div className="bg-stone-100 p-4 border-2 rounded-2xl border-orange-300">
              <h4 className="font-black text-orange-800 text-[10px] uppercase tracking-widest mb-1">
                Order Info:
              </h4>
              <p><span className="font-bold">Full Order ID:</span> {o.id}</p>
              <p>
                <span className="font-bold">Placed:</span>{" "}
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>

            {/* ITEMS */}
            <div className="bg-stone-100 p-4 rounded-2xl border-2 border-violet-300">
              <h4 className="font-black text-violet-800 text-[10px] uppercase tracking-widest mb-1">
                Items:
              </h4>
              {o.items.map((item, i) => (
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
              <p><span className="font-bold">Email:</span> {o.customerEmail || "N/A"}</p>
              <p><span className="font-bold">Phone:</span> {o.customerPhone || "N/A"}</p>
            </div>

            {/* PAYMENT */}
            <div className="bg-stone-100 p-4 rounded-2xl border-2 border-green-300">
              <h4 className="font-black text-green-800 text-[10px] uppercase tracking-widest mb-1">
                Payment Details:
              </h4>
              <p><span className="font-bold">Status:</span> {o.status}</p>
              <p><span className="font-bold">Subtotal:</span> ${o.subtotal?.toFixed(2)}</p>
              <p><span className="font-bold">Tax:</span> ${o.tax?.toFixed(2)}</p>
              <p><span className="font-bold">Tendered:</span> ${o.cashTendered?.toFixed(2) || ""}</p>
              <p><span className="font-bold">Change:</span> ${o.changeGiven?.toFixed(2) || ""}</p>
              <p><span className="font-bold">Type:</span> {o.paymentType}</p>
              <p><span className="font-bold">Method:</span> {o.cardEntryMethod || ""}</p>
            </div>

            {/* PICKUP TIME */}
            {o.pickupTime && (
              <div>
                <h4 className="font-black text-stone-800 text-[10px] uppercase tracking-widest mb-1">
                  Pickup
                </h4>
                <p>
                  <span className="font-bold">Picked Up At:</span>{" "}
                  {new Date(o.pickupTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TOGGLE BUTTON */}
        <button
          onClick={() =>
            setExpandedOrder(expanded ? null : o.id)
          }
          className="w-full py-2.5 border-2 border-stone-200 text-stone-500 font-black uppercase text-[10px] rounded-xl hover:bg-stone-50 transition-all mt-4"
        >
          {expanded ? "Hide Details" : "View Details"}
        </button>
      </div>
    );
  };

  /* -------------------------------------------------------
     RENDER CATEGORY GROUPS
  -------------------------------------------------------- */
  const renderGroup = (label: string, key: keyof typeof groups) => {
    const color = COLORS[key];

    return (
      <div
        key={key}
        className={`mb-10 border-2 rounded-xl p-3 ${color.border} ${color.bg}`}
      >
        <button
          onClick={() => setOpen({ ...open, [key]: !open[key] })}
          className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${color.text} mb-3`}
        >
          <span>
            {label} ({groups[key].length})
          </span>
          <span>{open[key] ? "▲" : "▼"}</span>
        </button>

        {open[key] && (
          <div className="flex gap-6 overflow-x-auto pb-2">
            {groups[key].map((o) => Card(o))}
            {groups[key].length === 0 && (
              <p className="text-xs text-stone-500">No orders in this category.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------
     RENDER UNFILLED ORDERS (TOP)
  -------------------------------------------------------- */
  const renderUnfilled = () => {
    const color = COLORS.unfilled;

    return (
      <div
        className={`mb-10 border-2 rounded-xl p-3 ${color.border} ${color.bg}`}
      >
        
        <button
          onClick={() => setOpen({ ...open, unfilled: !open.unfilled })}
          className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${color.text} mb-3`}
        >
         ⚠️ Unfilled Orders ({unfilledOrders.length}) 
          <span>{open.unfilled ? "▲" : "▼"}</span>
        </button>

          {/* CTA BUTTON */}
            <button
              onClick={() => router.push("/manager/operations")}
              className=" inline-block 
              whitespace-nowrap 
              max-w-full 
              px-4 py-3 
              mb-2
              rounded-xl 
              bg-orange-400 
              text-white
              text-[10px] sm:text-xs 
              font-black 
              uppercase 
              tracking-[0.15em] 
              shadow 
              border-2
              border-red-600
              hover:bg-yellow-300 
              hover:text-red-600
              transition-all"
              >
           Operations Dashboard ➜
            </button>
           
     

        {open.unfilled && (
          <>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {unfilledOrders.map((o) => Card(o))}
              {unfilledOrders.length === 0 && (
                <p className="text-xs text-stone-500">No unfilled orders.</p>
              )}
            </div>

          </>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------
     FINAL RENDER
  -------------------------------------------------------- */
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
        Recent Orders
      </h2>

      {renderUnfilled()}

      {renderGroup("POS Orders", "POS")}
      {renderGroup("Pickup Orders", "pickup")}
      {renderGroup("Shipping Orders", "shipping")}
      {renderGroup("Delivery Orders", "delivery")}
    </div>
  );
}
