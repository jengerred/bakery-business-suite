"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  fulfillmentType: string;
  createdAt: string;
  items: any[];

  // Shipping fields
  shippingCarrier?: string;
  trackingNumber?: string;
  labelUrl?: string;
  fulfilledAt?: string;

  // Optional fields used in details panel
  customerEmail?: string;
  customerPhone?: string;
  paymentType?: string;
  cardEntryMethod?: string;
  stripePaymentId?: string;
  pickupTime?: string;
  subtotal?: number;
  tax?: number;
  cashTendered?: number;
  changeGiven?: number;
};

export default function OperationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("Pending Pickup");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const s = order.status?.toLowerCase() || "";
      const t = order.fulfillmentType?.toLowerCase() || "";

      if (filter === "Pending Pickup") return t === "pickup" && s !== "pickedup";
      if (filter === "Pending Shipping") return t === "shipping" && s !== "shipped";
      if (filter === "POS") return t === "pos";
      if (filter === "Completed") return ["shipped", "pickedup", "completed"].includes(s);
      return true;
    });
  };

  const currentOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Command Center
          </h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">
            Operations Dashboard
          </p>
        </div>

        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300 overflow-x-auto max-w-full">
          {["Pending Pickup", "Pending Shipping", "POS", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
                filter === tab ? "bg-white text-violet-600 shadow-sm" : "text-stone-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {filter === "Pending Pickup" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* UNPAID PICKUP */}
            <div>
              <h2 className="text-red-600 font-black uppercase tracking-widest text-xs mb-6 px-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Not Yet Paid
              </h2>
              <div className="space-y-6">
                {currentOrders
                  .filter(
                    (o) =>
                      o.status?.toLowerCase() === "unpaid" ||
                      o.status?.toLowerCase() === "pending"
                  )
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expandedOrder={expandedOrder}
                      setExpandedOrder={setExpandedOrder}
                      showPrice={true}
                    />
                  ))}
              </div>
            </div>

            {/* PAID PICKUP */}
            <div>
              <h2 className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-6 px-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full" /> Paid & Ready
              </h2>
              <div className="space-y-6">
                {currentOrders
                  .filter((o) => o.status?.toLowerCase() === "paid")
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expandedOrder={expandedOrder}
                      setExpandedOrder={setExpandedOrder}
                    />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* OTHER FILTERS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expandedOrder={expandedOrder}
                setExpandedOrder={setExpandedOrder}
                isArchivedView={filter === "Completed"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getPrimaryActionLabel(order: any) {
  const s = order.status?.toLowerCase();
  const t = order.fulfillmentType?.toLowerCase();

  const isUnpaid = s === "unpaid" || s === "pending";

  // Shipping workflow
  if (t === "shipping") {
    if (isUnpaid) return "Collect Payment";
    if (!order.trackingNumber) return "Enter Shipping Details";
    if (order.trackingNumber && !order.fulfilledAt) return "Mark as Shipped";
    if (order.fulfilledAt || s === "shipped") return "Shipped";
    return "Update Shipping";
  }

  // Pickup workflow
  if (t === "pickup") {
    if (isUnpaid) return "Collect Payment";
    if (s === "paid" && !order.pickupTime) return "Mark as Picked Up";
    if (order.pickupTime || s === "pickedup") return "Picked Up";
    return "Update Pickup";
  }

  // POS workflow
  if (t === "pos") {
    if (isUnpaid) return "Collect Payment";
    return "Completed";
  }

  return "Update";
}

function handlePrimaryAction(order: any) {
  const label = getPrimaryActionLabel(order);
  // Placeholder for now – wire to real endpoints later
  console.log("Primary action clicked:", label, "for order", order.id);
}

function OrderCard({
  order,
  expandedOrder,
  setExpandedOrder,
  isArchivedView,
  showPrice,
}: any) {
  const s = order.status?.toLowerCase();
  const t = order.fulfillmentType?.toLowerCase();

  let themeClass = "bg-purple-600";
  if (t === "shipping") themeClass = "bg-blue-600";
  if (t === "pos" || s === "completed" || s === "pickedup" || s === "shipped") {
    themeClass = "bg-emerald-500";
  }

  const isUnpaid = s === "unpaid" || s === "pending";
  const isPOS = t === "pos";

  const primaryLabel = getPrimaryActionLabel(order);

  return (
    <div
      className={`group bg-white border-2 border-stone-200 rounded-[2.5rem] p-6 transition-all duration-300 ${
        isArchivedView
          ? "opacity-40 grayscale-[0.6] hover:opacity-100 hover:grayscale-0 hover:shadow-xl hover:border-emerald-100"
          : "shadow-sm hover:shadow-xl"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${themeClass}`}
        >
          {order.fulfillmentType || "POS"}
        </span>
        <span className="text-stone-300 font-mono text-[10px]">
          #{order.id?.slice(0, 8)}
        </span>
      </div>

      {/* NAME + PRICE */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
          {order.customerName || "Walk-in"}
        </h3>
        {showPrice && (
          <span className="text-red-600 font-black text-lg tracking-tighter">
            ${order.total.toFixed(2)}
          </span>
        )}
      </div>

      {/* ITEMS */}
      <div className="mb-6">
        {order.items
          ?.slice(0, expandedOrder === order.id ? 99 : 1)
          .map((item: any, i: number) => (
            <p key={i} className="text-sm font-bold text-stone-600 py-1">
              <span className="text-violet-600">{item.quantity}x</span>{" "}
              {item.product.name}
            </p>
          ))}
      </div>

      {/* DETAILS PANEL */}
      {expandedOrder === order.id && (
        <div className="mt-4 space-y-4 text-sm text-stone-600">
          {/* CUSTOMER */}
          <div className="bg-stone-100 p-4 rounded-2xl">
            <h4 className="font-black text-stone-800 text-xs uppercase tracking-widest mb-2">
              Customer Details
            </h4>
            <p>
              <span className="font-bold">Name:</span>{" "}
              {order.customerName || "N/A"}
            </p>
            <p>
              <span className="font-bold">Email:</span>{" "}
              {order.customerEmail || "N/A"}
            </p>
            <p>
              <span className="font-bold">Phone:</span>{" "}
              {order.customerPhone || "N/A"}
            </p>
          </div>

          {/* PAYMENT */}
          <div className="bg-stone-100 p-4 rounded-2xl">
            <h4 className="font-black text-stone-800 text-xs uppercase tracking-widest mb-2">
              Payment Details
            </h4>
            <p>
              <span className="font-bold">Status:</span> {order.status}
            </p>
            <p>
              <span className="font-bold">Type:</span>{" "}
              {order.paymentType || ""}
            </p>
            <p>
              <span className="font-bold">Method:</span>{" "}
              {order.cardEntryMethod || ""}
            </p>
            <p className="truncate">
              <span className="font-bold">Stripe:</span>{" "}
              {order.stripePaymentId || ""}
            </p>
          </div>

          {/* FULFILLMENT */}
          <div className="bg-stone-100 p-4 rounded-2xl">
            <h4 className="font-black text-stone-800 text-xs uppercase tracking-widest mb-2">
              Fulfillment
            </h4>
            <p>
              <span className="font-bold">Type:</span>{" "}
              {order.fulfillmentType}
            </p>
            <p>
              <span className="font-bold">Created:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            {order.pickupTime && (
              <p>
                <span className="font-bold">Picked Up:</span>{" "}
                {new Date(order.pickupTime).toLocaleString()}
              </p>
            )}
            {order.fulfilledAt && (
              <p>
                <span className="font-bold">Fulfilled:</span>{" "}
                {new Date(order.fulfilledAt).toLocaleString()}
              </p>
            )}
            {order.trackingNumber && (
              <p>
                <span className="font-bold">Tracking #:</span>{" "}
                {order.trackingNumber}
              </p>
            )}
            {order.shippingCarrier && (
              <p>
                <span className="font-bold">Carrier:</span>{" "}
                {order.shippingCarrier}
              </p>
            )}
          </div>

          {/* ACCOUNTING */}
          <div className="bg-stone-100 p-4 rounded-2xl">
            <h4 className="font-black text-stone-800 text-xs uppercase tracking-widest mb-2">
              Accounting
            </h4>
            <p>
              <span className="font-bold">Subtotal:</span> $
              {order.subtotal?.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Tax:</span> $
              {order.tax?.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Tendered:</span> $
              {(order.cashTendered).toFixed(2) || ""}
            </p>
            <p>
              <span className="font-bold">Change:</span> $
              {(order.changeGiven).toFixed(2) || ""}
            </p>
          </div>
        </div>
      )}

      {/* PRIMARY ACTION BUTTON (shipping/pickup/POS aware) */}
      <button
        onClick={() => handlePrimaryAction(order)}
        className={`w-full p-4 rounded-2xl text-white mb-3 text-center transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
          isUnpaid ? "bg-red-600" : themeClass
        }`}
      >
        {primaryLabel}
      </button>

      {/* EXPAND BUTTON */}
      <button
        onClick={() =>
          setExpandedOrder(expandedOrder === order.id ? null : order.id)
        }
        className="w-full py-3 border-2 border-stone-100 text-stone-400 font-black uppercase text-[10px] rounded-2xl hover:bg-stone-50 transition-colors"
      >
        {expandedOrder === order.id ? "Hide Details" : "View Details"}
      </button>
    </div>
  );
}
