"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import POSNav from "../../components/POSNav";


/* -------------------------------------------------------
   ORDER TYPE
-------------------------------------------------------- */
type Order = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  fulfillmentType: string;
  createdAt: string;

  items: {
    quantity: number;
    product: { name: string; price: number };
  }[];

  pickupTime?: string;

  customerEmail?: string;
  customerPhone?: string;

  paymentType?: string;
  cardEntryMethod?: string;
  stripePaymentId?: string;

  subtotal?: number;
  tax?: number;
  cashTendered?: number;
  changeGiven?: number;

  shippingCarrier?: string;
  trackingNumber?: string;
  labelUrl?: string;
  fulfilledAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* -------------------------------------------------------
   MAIN PICKUP TAB
-------------------------------------------------------- */
export default function PickupOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [showPickedUp, setShowPickedUp] = useState(false);
  const [showFulfillmentQueue, setShowFulfillmentQueue] = useState(true);

  const router = useRouter();
const [initialLoad, setInitialLoad] = useState(true);
const previousOrdersRef = useRef<any[]>([]);


const loadOrders = async (isPolling = false) => {
  try {
    if (!isPolling) setLoading(true);

    const res = await fetch(`${API_URL}/api/orders`);
    const data = await res.json();

    const pickupOnly = data.filter((o: any) =>
      (o.fulfillmentType ||
        o.FulfillmentType ||
        o.fulfillment_type)?.toLowerCase() === "pickup"
    );

    // Compare with ref
    const oldJson = JSON.stringify(previousOrdersRef.current);
    const newJson = JSON.stringify(pickupOnly);

    if (oldJson !== newJson) {
      setOrders(pickupOnly);
      previousOrdersRef.current = pickupOnly;
    }

  } catch (err) {
    console.error("Pickup orders load error:", err);
  } finally {
    if (!isPolling) {
      setLoading(false);
      setInitialLoad(false);
    }
  }
};


useEffect(() => {
  loadOrders(false); // first load shows spinner

  const interval = setInterval(() => {
    loadOrders(true); // polling does NOT toggle loading
  }, 3000);

  return () => clearInterval(interval);
}, []);



  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });
      await loadOrders();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  /* -------------------------------------------------------
     FILTERING LOGIC
  -------------------------------------------------------- */

  const fulfillmentQueue = orders.filter((o) =>
    ["pending", "paid"].includes(o.status)
  );

  const readyOrders = orders.filter((o) => o.status === "Ready");

  const readyUnpaid = readyOrders.filter((o) => o.status === "Ready" && o.paymentType !== "card");
  const readyPaid = readyOrders.filter((o) => o.status === "Ready" && o.paymentType ===  "card");

  const pickedUp = orders.filter((o) => o.status === "PickedUp");

  return (
    <div className="min-h-screen px-8 py-2 bg-fuchsia-300/30 flex flex-col gap-4">

      <POSNav active="pickup" />

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">
          Pickup Orders Queue
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-violet-600 mt-2 font-bold">
          Cashier View • Today’s Orders
        </p>

        {loading && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <p className="text-xs text-stone-500">Refreshing orders…</p>
          </div>
        )}
      </div>

      {/* PICKED UP (COLLAPSIBLE) */}
      <div className="mb-10 border-2 rounded-xl border-stone-600 p-2 bg-stone-300/90">
        <button
          onClick={() => setShowPickedUp(!showPickedUp)}
          className="flex items-center justify-center w-full text-left text-sm font-black uppercase tracking-[0.25em] text-slate-700 mb-3"
        >
          <span>View Picked Up Orders: {showPickedUp ? "▲" : "▼"}</span>
        </button>

        {showPickedUp && (
          <div className="flex gap-4 overflow-x-auto pb-2">

            {pickedUp.map((order) => (
              <div className="min-w-[260px]" key={order.id}>
                <PickupCard
                  order={order}
                  variant="picked-up"
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                />
              </div>
            ))}

            {pickedUp.length === 0 && (
              <p className="text-xs text-stone-400">No completed pickups yet.</p>
            )}
          </div>
        )}
      </div>

     {/* FULFILLMENT QUEUE (COLLAPSIBLE) */}
      <div className="mb-10 border-2 rounded-xl border-violet-600 p-2 bg-violet-300/50">
        <button
          onClick={() => setShowFulfillmentQueue(!showFulfillmentQueue)}
          className="flex items-center justify-center w-full text-sm font-black uppercase tracking-[0.25em] text-violet-700 mb-3"
        >
          <span>Fulfillment Queue: {showFulfillmentQueue ? "▲" : "▼"}</span>
        </button>

        {showFulfillmentQueue && (
          <div className="flex gap-4 overflow-x-auto pb-2">

            {fulfillmentQueue.map((order) => (
              <div className="min-w-[260px]" key={order.id}>
                <PickupCard
                  order={order}
                  variant="prep"
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                  onMarkReady={() => updateStatus(order.id, "Ready")}
                />
              </div>
            ))}

            {fulfillmentQueue.length === 0 && (
              <p className="text-xs text-stone-400">No orders waiting to be prepared.</p>
            )}
          </div>
        )}
      </div>



     {/* READY FOR PICKUP */}
      <div className="mb-10 border-2 rounded-xl border-green-800 p-2 bg-green-200/50">
        <h2 className="text-lg text-center font-black uppercase tracking-[0.25em] mb-4 text-green-800">
         -- Ready for Pickup --
        </h2>

        {/* NOT YET PAID ROW */}
        <h3 className="text-xs font-black uppercase tracking-widest text-red-600 m-2">
          🔴 Not Yet Paid
        </h3>
        <div className="flex gap-4 overflow-x-auto p-2 bg-red-600 m-2 border-2 border-red-800 rounded-xl">
          {readyUnpaid.map((order) => (
            <div className="min-w-[260px]" key={order.id}>
              <PickupCard
                order={order}
                variant="ready-unpaid"
                expandedOrder={expandedOrder}
                setExpandedOrder={setExpandedOrder}
                onCollectPayment={() => router.push(`/pos?orderId=${order.id}`)}
              />
            </div>
          ))}

          {readyUnpaid.length === 0 && (
            <p className="text-xs text-stone-400">No unpaid ready orders.</p>
          )}
        </div>
<br/>
        {/* PAID ROW */}
        <h3 className="text-xs font-black uppercase tracking-widest text-green-800 mt-6 m-2">
          🟢 Paid
        </h3>

        <div className="flex gap-4 overflow-x-auto p-2 border-2 border-green-700 rounded-xl bg-green-500 m-2">
          {readyPaid.map((order) => (
            <div className="min-w-[260px]" key={order.id}>
              <PickupCard
                order={order}
                variant="ready-paid"
                expandedOrder={expandedOrder}
                setExpandedOrder={setExpandedOrder}
                onMarkPickedUp={() => updateStatus(order.id, "PickedUp")}
              />
            </div>
          ))}

          {readyPaid.length === 0 && (
            <p className="text-xs text-stone-400">No paid ready orders.</p>
          )}
        </div>
      </div>

          </div>
        );
      }

/* -------------------------------------------------------
   CARD COMPONENT
-------------------------------------------------------- */
function PickupCard({
  order,
  variant,
  expandedOrder,
  setExpandedOrder,
  onMarkReady,
  onCollectPayment,
  onMarkPickedUp,
}: {
  order: Order;
  variant: "prep" | "ready-unpaid" | "ready-paid" | "picked-up";
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  onMarkReady?: () => void;
  onCollectPayment?: () => void;
  onMarkPickedUp?: () => void;
}) {
  const pickupNumber = order.id.slice(-4).toUpperCase();

  const showTimestamp = Boolean(order.pickupTime);
  const timestamp = order.pickupTime ? new Date(order.pickupTime) : null;

  const isPickedUp = variant === "picked-up";

  return (
    <div className="bg-white border-1 border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">

          {/* LEFT SIDE — DOT + NAME */}
          <div className="flex items-center gap-2">

            {/* Status Dot */}
            {variant === "ready-unpaid" && (
              <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-800"></span>
            )}
            {variant === "ready-paid" && (
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-green-800"></span>
            )}
          
          {/* PREP DOT — RED IF UNPAID, GREEN IF PAID */}
            {variant === "prep" && order.cardEntryMethod === "" && (
              <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-800"></span>
            )}

            {variant === "prep" && order.cardEntryMethod !== "" && (
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-green-800"></span>
            )}


            {variant === "picked-up" && (
              <span className="w-3 h-3 rounded-full bg-stone-400"></span>
            )}

                <h3 className="text-xl font-black uppercase text-slate-900 leading-none">
                  {order.customerName}
                </h3>
          </div>
        <span className="text-lg font-black text-violet-600">
          #{pickupNumber}
        </span>
      </div>

      {/* TIMESTAMP + AMOUNT */}
      <div className="flex justify-between items-center mb-4">
        {showTimestamp ? (
          <p className="text-[11px] font-bold uppercase text-stone-500">
            {timestamp?.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        ) : (
          <div />
        )}

       {!isPickedUp && (
      <p
        className={
          (order.status === "pending" || 
          (order.status === "Ready" && order.paymentType !== "card"))
            ? "text-lg font-black text-red-600 tracking-tight"
            : "text-lg font-black text-stone-700 tracking-tight"
        }
      >
        ${order.total.toFixed(2)}
      </p>

      )}

      </div>

      {/* ITEMS */}
      <div className="mb-4 -mt-4">
        {order.items?.map((item, i) => (
          <p key={i} className="text-sm font-bold text-stone-700">
            <span className="text-violet-600">{item.quantity}×</span>{" "}
            {item.product?.name}
          </p>
        ))}
      </div>

      {/* DETAILS PANEL */}
      {expandedOrder === order.id && (
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
          {order.pickupTime && (
            <div>
              <h4 className="font-black text-stone-800 text-[10px] uppercase tracking-widest mb-1">
                Pickup
              </h4>
              <p>
                <span className="font-bold">Picked Up At:</span>{" "}
                {new Date(order.pickupTime).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* BUTTONS */}
      {variant === "prep" && (
        <button
          onClick={onMarkReady}
          className="w-full py-3 rounded-xl bg-violet-500 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow hover:bg-violet-600 transition-all mt-4"
        >
          Mark Ready for Pickup
        </button>
      )}

      {variant === "ready-unpaid" && (
        <button
          onClick={onCollectPayment}
          className="w-full py-3 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow hover:bg-red-700 transition-all mt-4"
        >
          Collect Payment
        </button>
      )}

      {variant === "ready-paid" && (
        <button
          onClick={onMarkPickedUp}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow hover:bg-emerald-700 transition-all mt-4"
        >
          Print Receipt
        </button>
      )}

      {variant === "picked-up" && (
        <button
          disabled
          className="w-full py-3 rounded-xl bg-stone-200 text-stone-500 text-[11px] font-black uppercase tracking-[0.25em] cursor-default mt-4"
        >
          Picked Up
        </button>
      )}

      {/* DETAILS TOGGLE */}
      <button
        onClick={() =>
          setExpandedOrder(expandedOrder === order.id ? null : order.id)
        }
        className="w-full py-2.5 border-2 border-stone-200 text-stone-500 font-black uppercase text-[10px] rounded-xl hover:bg-stone-50 transition-all mt-3"
      >
        {expandedOrder === order.id ? "Hide Details" : "View Details"}
      </button>
    </div>
  );
}
