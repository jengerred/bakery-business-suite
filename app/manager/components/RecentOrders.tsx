"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "../../pos/hooks/useOrders";
import type { ManagerOrder } from "../../types/order";
import OrderDetails from "../../components/OrderDetails";

export default function RecentOrders({ dateFilter }: { dateFilter: string }) {
  const router = useRouter();

  /* -------------------------------------------------------
     UI STATE
  -------------------------------------------------------- */
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [open, setOpen] = useState({
    unfilled: false,
    POS: false,
    pickup: false,
    shipping: false,
    delivery: false,
  });

  /* -------------------------------------------------------
     UNIFIED ORDER ENGINE
  -------------------------------------------------------- */
  const { loading, sorted, byFulfillment } = useOrders();

  if (loading) {
    return (
      <div className="text-center py-10 text-slate-500">
        Loading recent orders…
      </div>
    );
  }

  /* -------------------------------------------------------
     DATE FILTER LOGIC
  -------------------------------------------------------- */
  const filterByDate = (order: ManagerOrder) => {
    const created = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === "today") {
      return created.toDateString() === now.toDateString();
    }

    if (dateFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return created.toDateString() === yesterday.toDateString();
    }

    if (dateFilter === "7") {
      const diff =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    if (dateFilter === "30") {
      const diff =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }

    return true; // "all"
  };

  /* -------------------------------------------------------
     APPLY DATE FILTER TO ALL ORDER GROUPS
  -------------------------------------------------------- */
  const allOrders = sorted.newest.filter(filterByDate);

  const groups = {
    POS: byFulfillment.pos.all.filter(filterByDate),
    pickup: byFulfillment.pickup.all.filter(filterByDate),
    shipping: byFulfillment.shipping.all.filter(filterByDate),
    delivery: byFulfillment.delivery.all.filter(filterByDate),
  };

  const unfilledPickup = byFulfillment.pickup.needs.filter(filterByDate);
  const unfilledShipping = byFulfillment.shipping.needs.filter(filterByDate);
  const unfilledDelivery = byFulfillment.delivery.needs.filter(filterByDate);

  const unfilledCount =
    unfilledPickup.length +
    unfilledShipping.length +
    unfilledDelivery.length;

  const pickupReady = byFulfillment.pickup.ready.filter(filterByDate);
  const pickupCompleted = byFulfillment.pickup.completed.filter(filterByDate);

  const shippingReady =
    byFulfillment.shipping.readyToPack.filter(filterByDate);
  const shippingShipped =
    byFulfillment.shipping.shipped.filter(filterByDate);

  const deliveryReady = byFulfillment.delivery.ready.filter(filterByDate);
  const deliveryTracking =
    byFulfillment.delivery.outForDelivery.filter(filterByDate);
  const deliveryDelivered =
    byFulfillment.delivery.delivered.filter(filterByDate);

  /* -------------------------------------------------------
     COLORS
  -------------------------------------------------------- */
  const COLORS = {
    unfilled: {
      border: "border-red-600",
      bg: "bg-yellow-100/50",
      text: "text-red-800",
    },
    POS: {
      border: "border-pink-400",
      bg: "bg-pink-100/40",
      text: "text-pink-600",
    },
    pickup: {
      border: "border-purple-300",
      bg: "bg-purple-100/40",
      text: "text-purple-800",
    },
    shipping: {
      border: "border-blue-400",
      bg: "bg-blue-100/40",
      text: "text-blue-800",
    },
    delivery: {
      border: "border-orange-400",
      bg: "bg-orange-100/50",
      text: "text-orange-600",
    },
  };

  /* -------------------------------------------------------
     CARD COMPONENT (WITH ORDER DETAILS)
  -------------------------------------------------------- */
  const Card = (o: ManagerOrder) => {
    const expanded = expandedOrder === o.id;

    const theme =
      {
        pickup: "border-purple-600 hover:shadow-purple-200",
        shipping: "border-blue-600 hover:shadow-blue-200",
        POS: "border-pink-500 hover:shadow-pink-200",
        delivery: "border-orange-500 hover:shadow-orange-200",
      }[o.fulfillmentType] || "border-slate-300";

    return (
      <div
        key={o.id}
        className={`bg-white border-2 ${theme} rounded-3xl p-5 mt-2 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-black uppercase text-slate-900 leading-none">
            {o.customerName || "GUEST"}
          </h3>

          <span className="text-sm font-black text-violet-600">
            #{o.id.slice(-4).toUpperCase()}
          </span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-bold uppercase text-stone-500">
            {new Date(o.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <p className="text-lg font-black text-slate-900">
            ${o.total.toFixed(2)}
          </p>
        </div>

        <div className="mb-4 -mt-2">
          {o.items.slice(0, 3).map((item, i) => (
            <p key={i} className="text-sm font-bold text-stone-700 truncate">
              <span className="text-violet-600">{item.quantity}×</span>{" "}
              {item.product?.name}
            </p>
          ))}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setExpandedOrder(expanded ? null : o.id)}
          className="w-full py-2.5 border-2 border-stone-200 text-stone-500 font-black uppercase text-[10px] rounded-xl hover:bg-stone-50 transition-all mt-2"
        >
          {expanded ? "Hide Details" : "View Details"}
        </button>

        {/* Shared Order Details */}
        {expanded && (
          <div className="mt-4">
            <OrderDetails order={o} />
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------
     SUBSECTION RENDERER (VERTICAL GRID)
  -------------------------------------------------------- */
  const renderSubsection = (
    label: string,
    orders: ManagerOrder[],
    textColor: string,
    sectionBorder: string
  ) => (
    <div className="mb-6">
      <div
        className={`border-4 rounded-3xl p-4 bg-white/50 ${sectionBorder}`}
      >
        <h4
          className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 px-2 py-1 inline-block rounded-lg ${textColor}`}
        >
          {label} ({orders.length})
        </h4>

        {orders.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-4
              overflow-y-auto
              max-h-[500px]
              pr-2
            "
          >
            {orders.map(Card)}
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic px-2 pb-2">
            No orders
          </p>
        )}
      </div>
    </div>
  );

  /* -------------------------------------------------------
     UI
  -------------------------------------------------------- */
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-black text-violet-900 uppercase tracking-wide">
        Recent Orders
      </h2>

      {/* UNFILLED SECTION */}
      <div
        className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.unfilled.border} ${COLORS.unfilled.bg}`}
      >
        <button
          onClick={() => setOpen({ ...open, unfilled: !open.unfilled })}
          className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.unfilled.text} mb-3`}
        >
          ⚠️ Unfilled Orders ({unfilledCount}){" "}
          <span>{open.unfilled ? "▲" : "▼"}</span>
        </button>

        <button
          onClick={() => router.push("/manager/operations")}
          className="inline-block whitespace-nowrap px-4 py-3 mb-6 rounded-xl bg-orange-400 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] shadow border-2 border-red-600 hover:bg-yellow-300 hover:text-red-600 transition-all"
        >
          Operations Dashboard ➜
        </button>

        {open.unfilled && (
          <div className="space-y-2">
            {renderSubsection(
              "Pickup – Unfulfilled",
              unfilledPickup,
              "text-purple-700 bg-purple-100/50",
              "border-purple-400"
            )}

            {renderSubsection(
              "Shipping – Unfulfilled",
              unfilledShipping,
              "text-blue-700 bg-blue-100/50",
              "border-blue-400"
            )}

            {renderSubsection(
              "Delivery – Unfulfilled",
              unfilledDelivery,
              "text-orange-600 bg-orange-100",
              "border-orange-600"
            )}
          </div>
        )}
      </div>

      {/* ALL ORDERS */}
      <div className="border-4 border-violet-300 rounded-[2rem] p-6">
        <h2 className="flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] text-violet-600 mb-3">
          All Orders ({allOrders.length})
        </h2>

        {/* POS */}
        <div
          className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.POS.border} ${COLORS.POS.bg}`}
        >
          <button
            onClick={() => setOpen({ ...open, POS: !open.POS })}
            className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.POS.text} mb-6`}
          >
            <span>POS Orders ({groups.POS.length})</span>
            <span>{open.POS ? "▲" : "▼"}</span>
          </button>

          {open.POS && (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                gap-4
                overflow-y-auto
                max-h-[500px]
                pr-2
              "
            >
              {groups.POS.map(Card)}
            </div>
          )}
        </div>

        {/* PICKUP */}
        <div
          className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.pickup.border} ${COLORS.pickup.bg}`}
        >
          <button
            onClick={() => setOpen({ ...open, pickup: !open.pickup })}
            className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.pickup.text} mb-6`}
          >
            <span>Pickup Orders ({groups.pickup.length})</span>
            <span>{open.pickup ? "▲" : "▼"}</span>
          </button>

          {open.pickup && (
            <div className="space-y-2">
              {renderSubsection(
                "Unfulfilled",
                unfilledPickup,
                "text-red-600 bg-red-100/50",
                "border-red-500"
              )}

              {renderSubsection(
                "Ready for Pickup",
                pickupReady,
                "text-purple-600 bg-purple-100/50",
                "border-purple-500"
              )}

              {renderSubsection(
                "Completed",
                pickupCompleted,
                "text-green-600 bg-green-100/60",
                "border-green-500"
              )}
            </div>
          )}
        </div>

        {/* SHIPPING */}
        <div
          className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.shipping.border} ${COLORS.shipping.bg}`}
        >
          <button
            onClick={() => setOpen({ ...open, shipping: !open.shipping })}
            className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.shipping.text} mb-6`}
          >
            <span>Shipping Orders ({groups.shipping.length})</span>
            <span>{open.shipping ? "▲" : "▼"}</span>
          </button>

          {open.shipping && (
            <div className="space-y-2">
              {renderSubsection(
                "Unfulfilled",
                unfilledShipping,
                "text-red-600 bg-red-100/50",
                "border-red-500"
              )}

              {renderSubsection(
                "Ready to Pack",
                shippingReady,
                "text-blue-600 bg-blue-100/50",
                "border-blue-500"
              )}

              {renderSubsection(
                "Shipped",
                shippingShipped,
                "text-green-600 bg-green-100/50",
                "border-green-500"
              )}
            </div>
          )}
        </div>

        {/* DELIVERY */}
        <div
          className={`mb-10 border-4 rounded-[2rem] p-6 ${COLORS.delivery.border} ${COLORS.delivery.bg}`}
        >
          <button
            onClick={() => setOpen({ ...open, delivery: !open.delivery })}
            className={`flex items-center justify-between w-full text-sm font-black uppercase tracking-[0.25em] ${COLORS.delivery.text} mb-6`}
          >
            <span>Delivery Orders ({groups.delivery.length})</span>
            <span>{open.delivery ? "▲" : "▼"}</span>
          </button>

          {open.delivery && (
            <div className="space-y-2">
              {renderSubsection(
                "Unfulfilled",
                unfilledDelivery,
                "text-orange-700 bg-red-100/50",
                "border-orange-600"
              )}

              {renderSubsection(
                "Ready for Delivery",
                deliveryReady,
                "text-orange-600 bg-orange-100/50",
                "border-orange-500"
              )}

              {renderSubsection(
                "Track Delivery",
                deliveryTracking,
                "text-blue-600 bg-blue-100/60",
                "border-blue-400"
              )}

              {renderSubsection(
                "Completed",
                deliveryDelivered,
                "text-green-600 bg-green-100/60",
                "border-green-500"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
