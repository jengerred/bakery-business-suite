"use client";

import { useEffect, useRef, useState } from "react";
import type { ManagerOrder } from "./types";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RecentOrders({ todayOrders }: { todayOrders: ManagerOrder[] }) {
  const router = useRouter();

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [open, setOpen] = useState({
    unfilled: true,
    POS: true,
    pickup: true,
    shipping: true,
    delivery: true,
  });

  const [liveOrders, setLiveOrders] = useState<ManagerOrder[]>([]);
  const previousRef = useRef<string>("");

  const loadAllOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      const newJson = JSON.stringify(data);
      if (newJson !== previousRef.current) {
        setLiveOrders(data);
        previousRef.current = newJson;
      }
    } catch (err) {
      console.error("Live orders load error:", err);
    }
  };

  useEffect(() => {
    loadAllOrders();
    const interval = setInterval(loadAllOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...liveOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups = {
    POS: sorted.filter((o) => o.fulfillmentType === "POS"),
    pickup: sorted.filter((o) => o.fulfillmentType === "pickup"),
    shipping: sorted.filter((o) => o.fulfillmentType === "shipping"),
    delivery: sorted.filter((o) => o.fulfillmentType === "delivery"),
  };

  // Logic filters for sub-sections
  const unfilledPickup = groups.pickup.filter((o) => o.status === "pending");
  const unfilledShipping = groups.shipping.filter((o) => o.status === "paid");
  const unfilledDelivery = groups.delivery.filter((o) => o.status === "pending" || o.status === "paid");
  const unfilledCount = unfilledPickup.length + unfilledShipping.length + unfilledDelivery.length;

  const pickupReady = groups.pickup.filter((o) => o.status === "Ready");
  const pickupCompleted = groups.pickup.filter((o) => o.status === "PickedUp" || o.status === "completed");

  const shippingReady = groups.shipping.filter((o) => o.status === "Ready");
  const shippingShipped = groups.shipping.filter((o) => o.status === "shipped");

  const deliveryReady = groups.delivery.filter((o) => o.status === "Ready");
  const deliveryTracking = groups.delivery.filter((o) => ["OutForDelivery", "InTransit"].includes(o.status));
  const deliveryDelivered = groups.delivery.filter((o) => ["Delivered", "completed"].includes(o.status));

  const COLORS = {
    unfilled: { border: "border-red-600", bg: "bg-yellow-100/50", text: "text-red-800" },
    POS: { border: "border-pink-400", bg: "bg-pink-100/40", text: "text-pink-600" },
    pickup: { border: "border-purple-300", bg: "bg-purple-100/40", text: "text-purple-800" },
    shipping: { border: "border-blue-400", bg: "bg-blue-100/40", text: "text-blue-800" },
    delivery: { border: "border-orange-400", bg: "bg-orange-100/50", text: "text-orange-600" },
  };

  const Card = (o: ManagerOrder) => {
    const expanded = expandedOrder === o.id;
    const theme = {
      pickup: "border-purple-600 hover:shadow-purple-200",
      shipping: "border-blue-600 hover:shadow-blue-200",
      POS: "border-pink-500 hover:shadow-pink-200",
      delivery: "border-orange-500 hover:shadow-orange-200",
    }[o.fulfillmentType] || "border-slate-300";

    return (
      <div key={o.id} className={`min-w-[280px] bg-white border-2 ${theme} rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-black uppercase text-slate-900 leading-none">{o.customerName || "GUEST"}</h3>
          <span className="text-sm font-black text-violet-600">#{o.id.slice(-4).toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-bold uppercase text-stone-500">{new Date(o.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
          <p className="text-lg font-black text-slate-900">${o.total.toFixed(2)}</p>
        </div>
        <div className="mb-4 -mt-2">
          {o.items.slice(0, 3).map((item, i) => (
            <p key={i} className="text-sm font-bold text-stone-700 truncate">
              <span className="text-violet-600">{item.quantity}×</span> {item.product?.name}
            </p>
          ))}
        </div>
        <button onClick={() => setExpandedOrder(expanded ? null : o.id)} className="w-full py-2.5 border-2 border-stone-200 text-stone-500 font-black uppercase text-[10px] rounded-xl hover:bg-stone-50 transition-all mt-2">
          {expanded ? "Hide Details" : "View Details"}
        </button>
      </div>
    );
  };

  const renderSubsection = (label: string, orders: ManagerOrder[], textColor: string, sectionBorder: string) => (
    <div className="mb-6">
      <div className={`border-4 rounded-3xl p-4 bg-white/50 ${sectionBorder}`}>
        <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 px-2 py-1 inline-block rounded-lg ${textColor}`}>
          {label} ({orders.length})
        </h4>
        
        {orders.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pt-2 pb-2 scrollbar-hide">{orders.map(Card)}</div>
        ) : (
          <p className="text-xs text-stone-400 italic px-2 pb-2">No orders</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-black text-violet-900 uppercase tracking-wide">Recent Orders</h2>

      {/* ATTENTION SECTION */}
      <div className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.unfilled.border} ${COLORS.unfilled.bg}`}>
        <button onClick={() => setOpen({ ...open, unfilled: !open.unfilled })} className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.unfilled.text} mb-3`}>
          ⚠️ Unfilled Orders ({unfilledCount}) <span>{open.unfilled ? "▲" : "▼"}</span>
        </button>

        <button
          onClick={() => router.push("/manager/operations")}
          className="inline-block whitespace-nowrap px-4 py-3 mb-6 rounded-xl bg-orange-400 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] shadow border-2 border-red-600 hover:bg-yellow-300 hover:text-red-600 transition-all"
        >
          Operations Dashboard ➜
        </button>

        {open.unfilled && (
          <div className="space-y-2">
            {renderSubsection("Pickup – Unfulfilled", unfilledPickup, "text-purple-700 bg-purple-100/50", "border-purple-400")}
            {renderSubsection("Shipping – Unfulfilled", unfilledShipping, "text-blue-700 bg-blue-100/50", "border-blue-400")}
            {renderSubsection("Delivery – Unfulfilled", unfilledDelivery, "text-orange-600 bg-orange-100", "border-orange-600")}
          </div>
        )}
      </div>

    <div className="border-4 border-violet-300 rounded-[2rem] p-6">
      <h2 className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] text-violet-600 mb-3`}>
              All Orders ({liveOrders.length})
      </h2>

      {/* POS GROUP */}
      <div className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.POS.border} ${COLORS.POS.bg}`}>
        <button onClick={() => setOpen({ ...open, POS: !open.POS })} className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.POS.text} mb-6`}>
          <span>POS Orders ({groups.POS.length})</span> <span>{open.POS ? "▲" : "▼"}</span>
        </button>
        {open.POS && <div className="flex gap-6 overflow-x-auto pt-4 pb-4 px-1">{groups.POS.map(Card)}</div>}
      </div>

      {/* PICKUP GROUP */}
      <div className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.pickup.border} ${COLORS.pickup.bg}`}>
        <button onClick={() => setOpen({ ...open, pickup: !open.pickup })} className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.pickup.text} mb-6`}>
          <span>Pickup Orders ({groups.pickup.length})</span> <span>{open.pickup ? "▲" : "▼"}</span>
        </button>
        {open.pickup && (
          <div className="space-y-2">
            {renderSubsection("Unfulfilled", unfilledPickup, "text-red-600 bg-red-100/50", "border-red-500")}
            {renderSubsection("Ready for Pickup", pickupReady, "text-purple-600 bg-purple-100/50", "border-purple-500")}
            {renderSubsection("Completed", pickupCompleted, "text-green-600 bg-green-100/60", "border-green-500")}
          </div>
        )}
      </div>

      {/* SHIPPING GROUP */}
      <div className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.shipping.border} ${COLORS.shipping.bg}`}>
        <button onClick={() => setOpen({ ...open, shipping: !open.shipping })} className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.shipping.text} mb-6`}>
          <span>Shipping Orders ({groups.shipping.length})</span> <span>{open.shipping ? "▲" : "▼"}</span>
        </button>
        {open.shipping && (
          <div className="space-y-2">
            {renderSubsection("Unfulfilled", unfilledShipping, "text-red-600 bg-red-100/50", "border-red-500")}
            {renderSubsection("Ready to Pack", shippingReady, "text-blue-600 bg-blue-100/50", "border-blue-500")}
            {renderSubsection("Shipped", shippingShipped, "text-green-600 bg-green-100/50", "border-green-500")}
          </div>
        )}
      </div>

      {/* DELIVERY GROUP */}
      <div className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.delivery.border} ${COLORS.delivery.bg}`}>
        <button onClick={() => setOpen({ ...open, delivery: !open.delivery })} className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.delivery.text} mb-6`}>
          <span>Delivery Orders ({groups.delivery.length})</span> <span>{open.delivery ? "▲" : "▼"}</span>
        </button>
        {open.delivery && (
          <div className="space-y-2">
            {/* Red-Orange fix to prevent pinking */}
            {renderSubsection("Unfulfilled", unfilledDelivery, "text-orange-700 bg-red-100/50", "border-orange-600")} 
            {renderSubsection("Ready for Delivery", deliveryReady, "text-orange-600 bg-orange-100/50", "border-orange-500")}
            {renderSubsection("Track Delivery", deliveryTracking, "text-blue-600 bg-blue-100/60", "border-blue-400")}
            {renderSubsection("Completed", deliveryDelivered, "text-green-600 bg-green-100/60", "border-green-500")}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}