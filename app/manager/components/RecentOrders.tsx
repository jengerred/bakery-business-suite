"use client";

import type { CompletedOrder } from "../../pos/context/OrderHistoryContext";

export default function RecentOrders({ todayOrders }: { todayOrders: CompletedOrder[] }) {
  // Sort newest first - added created_at as a fallback
  const sortedOrders = [...todayOrders].sort((a: any, b: any) => {
    const timeA = new Date(a.created_at || a.timestamp || a.Timestamp).getTime();
    const timeB = new Date(b.created_at || b.timestamp || b.Timestamp).getTime();
    return timeB - timeA;
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
            {sortedOrders.map((o: any) => (
              <tr key={o.id || o.Id} className="hover:bg-blue-50/50 transition-colors divide-x">
                {/* 1-2: ID & Timestamp */}
                <td className="p-2 align-top">
                  <div className="font-bold">
                    {new Date(o.created_at || o.timestamp || o.Timestamp).toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">{(o.id || o.Id)?.slice(0, 18)}...</div>
                </td>

                {/* 3-6: Customer Data */}
                <td className="p-2 align-top bg-gray-50/30">
                  <div className="text-gray-900 font-bold">{o.customerName || o.CustomerName || "GUEST"}</div>
                  <div>{o.customerEmail || o.CustomerEmail || "No Email"}</div>
                  <div>{o.customerPhone || o.CustomerPhone || "No Phone"}</div>
                  <div className="text-gray-400">UID: {o.customerId || o.CustomerId || "None"}</div>
                </td>

                {/* 7-9: Fulfillment & Pickup */}
                <td className="p-2 align-top">
                  <div className="text-blue-600 font-black uppercase">{o.fulfillmentType || o.FulfillmentType}</div>
                  <div className="text-orange-600 font-bold">
                    {o.pickupTime || o.PickupTime ? `PICKUP: ${o.pickupTime || o.PickupTime}` : "IMMEDIATE"}
                  </div>
                  <div className="italic text-gray-500 mt-1">"{o.notes || o.Notes || ""}"</div>
                </td>

                {/* 10-14: Address */}
                <td className="p-2 align-top bg-gray-50/30">
                  <div>{o.address || o.Address || "In-Store"}</div>
                  <div>{o.city || o.City}, {o.state || o.State} {o.zip || o.Zip}</div>
                </td>

                {/* 15-18: Payment Logic */}
                <td className="p-2 align-top">
                  <div className="font-bold uppercase text-purple-700">{o.paymentType || o.PaymentType}</div>
                  <div className="text-[9px]">Method: {o.cardEntryMethod || o.CardEntryMethod || "N/A"}</div>
                  <div className="text-[8px] text-gray-400 truncate w-32">Stripe: {o.stripePaymentId || o.StripePaymentId || "None"}</div>
                </td>

                {/* 19-22: Accounting */}
                <td className="p-2 align-top bg-gray-50/30 text-right">
                  <div>Sub: ${(o.subtotal || o.Subtotal || 0).toFixed(2)}</div>
                  <div>Tax: ${(o.tax || o.Tax || 0).toFixed(2)}</div>
                  <div className="text-green-600">Tender: ${(o.cashTendered || o.CashTendered || 0).toFixed(2)}</div>
                  <div className="text-red-500">Change: ${(o.changeGiven || o.ChangeGiven || 0).toFixed(2)}</div>
                </td>

                {/* 23: Total & Status */}
                <td className="p-2 align-top text-right">
                  <div className="text-sm font-black text-gray-900">${(o.total || o.Total || 0).toFixed(2)}</div>
                  <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                    (o.status || o.Status) === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.status || o.Status}
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