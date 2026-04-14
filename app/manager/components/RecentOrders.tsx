"use client";

import type { ManagerOrder } from "./types";

export default function RecentOrders({ todayOrders }: { todayOrders: ManagerOrder[] }) {
  const sortedOrders = [...todayOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function getFulfillmentStatus(o: ManagerOrder) {
    if (o.fulfillmentType === "pickup") {
      return o.pickupTime
        ? {
            text: `Picked up at ${new Date(o.pickupTime).toLocaleString()}`,
            color: "text-green-700",
          }
        : { text: "Not yet picked up", color: "text-red-600" };
    }

    if (o.fulfillmentType === "shipping")
      return { text: "Not yet shipped", color: "text-red-600" };

    if (o.fulfillmentType === "delivery")
      return { text: "Not yet delivered", color: "text-red-600" };

    return { text: "Completed in-store", color: "text-green-700" };
  }

  function getFulfillmentTypeColor(type: string) {
    return {
      POS: "text-blue-700",
      pickup: "text-purple-700",
      shipping: "text-orange-700",
      delivery: "text-teal-700",
    }[type] || "text-gray-700";
  }

  function getStatusColor(o: ManagerOrder) {
    const paid = o.status === "paid";
    const complete =
      (o.fulfillmentType === "pickup" && o.pickupTime) ||
      o.fulfillmentType === "POS";

    if (paid && complete) return "border-green-500";
    if (paid && !complete) return "border-yellow-500";
    return "border-red-500";
  }

  function getTotalColor(o: ManagerOrder) {
    if (o.status !== "paid") return "text-red-600";
    const complete =
      (o.fulfillmentType === "pickup" && o.pickupTime) ||
      o.fulfillmentType === "POS";
    return complete ? "text-green-700" : "text-yellow-600";
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
        {sortedOrders.map((o) => {
          const fulfillmentStatus = getFulfillmentStatus(o);

          return (
            <div
              key={o.id}
              className={`border-2 rounded-xl p-4 bg-white shadow transition ${getStatusColor(
                o
              )}`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {o.customerName || "GUEST"}
                  </div>

                  <div className="text-[11px] text-gray-500 font-mono">
                    Order ID: {o.id.slice(0, 18)}...
                  </div>

                  <div className="text-[11px] text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>

                  <div
                    className={`mt-1 font-semibold uppercase ${getFulfillmentTypeColor(
                      o.fulfillmentType
                    )}`}
                  >
                    {{
                      POS: "POS: In‑Person",
                      pickup: "Pickup Order",
                      shipping: "Shipping Order",
                      delivery: "Courier Delivery",
                    }[o.fulfillmentType] || "Unknown"}
                  </div>

                  <div className={`text-sm mt-1 ${fulfillmentStatus.color}`}>
                    {fulfillmentStatus.text}
                  </div>
                </div>

                {/* TOTAL + STATUS */}
                <div className="text-right">
                  <div
                    className={`text-xl font-black ${getTotalColor(o)}`}
                  >
                    ${o.total.toFixed(2)}
                  </div>

                  <div
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase inline-block mt-1 ${
                      o.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.status === "paid" ? "PAID" : "UNPAID"}
                  </div>
                </div>
              </div>

              {/* ACCORDION SECTIONS */}
              <div className="mt-4 space-y-2">
                
 {/* ITEMS */}
  <details className="group">
    <summary className="cursor-pointer font-semibold text-gray-800 group-open:text-blue-700">
      Items in Order
    </summary>

    <div className="mt-2 text-sm text-gray-700 pl-2 space-y-1">
      {o.items.map((item, idx) => (
        <div key={idx} className="flex justify-between">
          <div>
            <div className="font-semibold">{item.product.name}</div>
            <div className="text-[11px] text-gray-500">
              Qty {item.quantity} × ${item.product.price.toFixed(2)}
            </div>
          </div>

          <div className="font-bold">
            ${(item.quantity * item.product.price).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  </details>

                {/* CUSTOMER DETAILS */}
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-800 group-open:text-blue-700">
                    Customer Details
                  </summary>
                  <div className="mt-2 text-sm text-gray-700 pl-2">
                    <div>Email: {o.customerEmail || "None"}</div>
                    <div>Phone: {o.customerPhone || "None"}</div>

                    {(o.address || o.city || o.state || o.zip) && (
                      <div className="mt-2">
                        <div className="font-semibold">Address:</div>
                        <div>{o.address || "No Street"}</div>
                        <div>
                          {o.city}, {o.state} {o.zip}
                        </div>
                      </div>
                    )}

                    {o.notes && (
                      <div className="mt-2 italic text-gray-600">
                        “{o.notes}”
                      </div>
                    )}
                  </div>
                </details>

                {/* PAYMENT DETAILS */}
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-800 group-open:text-blue-700">
                    Payment Details
                  </summary>
                  <div className="mt-2 text-sm text-gray-700 pl-2">
                    <div>Type: {o.paymentType}</div>
                    <div>Method: {o.cardEntryMethod || "N/A"}</div>
                    <div className="truncate w-48 text-[11px] text-gray-500">
                      Stripe: {o.stripePaymentId || "None"}
                    </div>
                  </div>
                </details>

                {/* ACCOUNTING DETAILS */}
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-800 group-open:text-blue-700">
                    Accounting
                  </summary>
                  <div className="mt-2 text-sm text-gray-700 pl-2">
                    <div>Subtotal: ${o.subtotal.toFixed(2)}</div>
                    <div>Tax: ${o.tax.toFixed(2)}</div>
                    <div className="text-green-600">
                      Tendered: ${(o.cashTendered || 0).toFixed(2)}
                    </div>
                    <div className="text-red-600">
                      Change: ${(o.changeGiven || 0).toFixed(2)}
                    </div>
                  </div>
                </details>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
