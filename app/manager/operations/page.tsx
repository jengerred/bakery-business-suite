"use client";

import { useEffect, useState } from "react";

/* ---------------------------------------------------------
   Types (Matching our C# Model)
   --------------------------------------------------------- */
type OrderItem = {
  id: number;
  product: { name: string };
  quantity: number;
};

type Order = {
  id: string; // GUID from backend
  customerName: string;
  total: number;
  status: string;
  fulfillmentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 1. Fetch Orders from Backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 2. Handle Status Update (The Action Button)
  const handleUpdateStatus = async (orderId: string, currentMethod: string) => {
    const newStatus = currentMethod === "Shipping" ? "Shipped" : "PickedUp";

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });

      if (res.ok) {
        // Refresh the list after successful update
        loadOrders();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // 3. Filter Logic
  const filteredOrders = orders.filter((order) => {
    if (filter === "Pending") return order.status === "Pending";
    if (filter === "Shipping") return order.fulfillmentMethod === "Shipping" && order.status === "Pending";
    if (filter === "Pickup") return order.fulfillmentMethod === "Pickup" && order.status === "Pending";
    if (filter === "Completed") return ["Shipped", "PickedUp", "Completed"].includes(order.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Operations Dashboard
          </h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">
            Bakery Operations Command Center
          </p>
        </div>

        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300">
          {["Pending", "Shipping", "Pickup", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                filter === tab ? "bg-white text-violet-600 shadow-md" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="text-center text-violet-600 font-black animate-pulse py-20">
          LOADING LIVE ORDERS...
        </div>
      ) : (
        <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border-2 border-stone-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    order.fulfillmentMethod === 'Shipping' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                  }`}>
                    📦 {order.fulfillmentMethod}
                  </span>
                  <span className="text-stone-400 font-mono text-[10px]">#{order.id.slice(0, 8)}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none mb-1">
                  {order.customerName}
                </h3>
                <div className="text-stone-500 font-medium text-sm mb-6">
                  {order.items.map((item) => (
                    <p key={item.id}>{item.quantity}x {item.product.name}</p>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {order.status === "Pending" && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, order.fulfillmentMethod)}
                      className="w-full py-4 bg-violet-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
                    >
                      Mark as {order.fulfillmentMethod === 'Shipping' ? 'Shipped' : 'Picked Up'}
                    </button>
                  )}
                  <button className="w-full py-3 border-2 border-stone-100 text-stone-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-stone-50 transition-all">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-stone-200 rounded-[3rem]">
              <p className="text-stone-400 font-black uppercase tracking-widest">No {filter} Orders found</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}