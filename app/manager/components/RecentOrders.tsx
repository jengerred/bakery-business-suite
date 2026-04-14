"use client";

import type { ManagerOrder } from "./types";

export default function RecentOrders({ todayOrders }: { todayOrders: ManagerOrder[] }) {
  
  const sortedOrders = [...todayOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Master Audit Log (23-Column Schema)</h2>
      
      <div className="overflow-x-auto overflow-y-auto max-h-[700px] border rounded-lg">
        <table className="w-full text-[10px] text-left border-collapse min-w-[1500px]">
          <thead className="bg-gray-800 text-white sticky top-0 z-30">
            <tr className="divide-x divide-gray-700">
              <th className="p-2">1-2: ID & Time</th>
              <th className="p-2">3-6: Customer Detail</th>
              <th className="p-2">7-9: Fulfillment & Pickup</th>
              <th className="p-2">10-14: Address Info</th>
              <th className="p-2">15-18: Payment/Stripe</th>
              <th className="p-2">19-22: Accounting</th>
              <th className="p-2 text-right">23: Grand Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 font-medium">
            {sortedOrders.map((o) => (
              <tr key={o.id} className="hover:bg-blue-50/50 transition-colors divide-x">
                
                {/* 1-2: ID & Timestamp */}
                <td className="p-2 align-top">
                  <div className="font-bold">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">{o.id.slice(0, 18)}...</div>
                </td>

                {/* 3-6: Customer Data */}
                <td className="p-2 align-top bg-gray-50/30">
                  <div className="text-gray-900 font-bold">{o.customerName || "GUEST"}</div>
                  <div>{o.customerEmail || "No Email"}</div>
                  <div>{o.customerPhone || "No Phone"}</div>
                  <div className="text-gray-400">UID: {o.customerId || "None"}</div>
                </td>

              {/* 7-9: Fulfillment */}
                <td className="p-2 align-top">

                  {/* Friendly Fulfillment Label */}
                  <div className="text-blue-600 font-black uppercase">
                    {{
                      POS: "POS: IN PERSON ORDER",
                      shipping: "ONLINE: SHIPPING ORDER",
                      pickup: "ONLINE: PICKUP ORDER",
                      delivery: "ONLINE: COURIER DELIVERY ORDER",
                    }[o.fulfillmentType] || "UNKNOWN"}
                  </div>

                  {/* Status Line */}
                  <div className="text-orange-600 font-bold mt-1">
                    {o.fulfillmentType === "POS" && (
                      <>
                        IMMEDIATE
                        <div className="text-[9px] text-gray-500">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                      </>
                    )}


                    {o.fulfillmentType === "pickup" &&
                      (o.pickupTime
                        ? `PICKED UP: ${new Date(o.pickupTime).toLocaleString()}`
                        : "NOT YET PICKED UP")}

                    {o.fulfillmentType === "shipping" && "NOT YET SHIPPED"}

                    {o.fulfillmentType === "delivery" && "NOT YET DELIVERED"}
                  </div>

                  {/* Notes */}
                  <div className="italic text-gray-500 mt-1">
                    {o.notes ? `"${o.notes}"` : ""}
                  </div>

                </td>

                {/* 10-14: Address */}
                <td className="p-2 align-top bg-gray-50/30">
                  <div>{o.address || "In-Store"}</div>
                  <div>{o.city}, {o.state} {o.zip}</div>
                </td>

                {/* 15-18: Payment */}
                <td className="p-2 align-top">
                  <div className="font-bold uppercase text-purple-700">{o.paymentType}</div>
                  <div className="text-[9px]">Method: {o.cardEntryMethod || "N/A"}</div>
                  <div className="text-[8px] text-gray-400 truncate w-32">Stripe: {o.stripePaymentId || "None"}</div>
                </td>

                {/* 19-22: Accounting */}
                <td className="p-2 align-top bg-gray-50/30 text-right">
                  <div>Sub: ${o.subtotal.toFixed(2)}</div>
                  <div>Tax: ${o.tax.toFixed(2)}</div>
                  <div className="text-green-600">Tender: ${(o.cashTendered || 0).toFixed(2)}</div>
                  <div className="text-red-500">Change: ${(o.changeGiven || 0).toFixed(2)}</div>
                </td>

                {/* 23: Total & Status */}
                <td className="p-2 align-top text-right">
                  <div className="text-sm font-black text-gray-900">${o.total.toFixed(2)}</div>
                  <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                    o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
