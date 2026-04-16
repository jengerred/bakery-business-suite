"use client";

import { useEffect, useState } from "react";

/* ---------------------------------------------------------
   Types (Matching our C# Model & Supabase Schema)
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
  fulfillmentType: string; // ✅ Corrected from fulfillmentMethod
  createdAt: string;
  items: OrderItem[];
};

export default function OperationsPage() {
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
  const handleUpdateStatus = async (orderId: string, currentType: string) => {
    let newStatus = "Completed"; // Default for POS
    if (currentType === "Shipping") newStatus = "Shipped";
    if (currentType === "Pickup") newStatus = "PickedUp";

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });

      if (res.ok) {
        loadOrders(); // Refresh list
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // 3. Filter Logic (Uses fulfillmentType)
  const filteredOrders = orders.filter((order) => {
    if (filter === "Pending") return order.status === "Pending";
    if (filter === "Shipping") return order.fulfillmentType === "Shipping" && order.status === "Pending";
    if (filter === "Pickup") return order.fulfillmentType === "Pickup" && order.status === "Pending";
    if (filter === "POS") return order.fulfillmentType === "POS"; 
    if (filter === "Completed") return ["Shipped", "PickedUp", "Completed", "paid"].includes(order.status.toLowerCase());
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* HEADER SECTION */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Operations Dashboard
          </h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">
            Bakery Operations Command Center
          </p>
        </div>

        {/* TAB FILTERS - Added POS filter */}
        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300 flex-wrap">
          {["Pending", "Shipping", "Pickup", "POS", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 md:px-6 py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                filter === tab ? "bg-white text-violet-600 shadow-md" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="text-center text-violet-600 font-black animate-pulse py-20 uppercase tracking-[0.3em]">
          Loading Live Orders...
        </div>
      ) : (
        <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border-2 border-stone-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    order.fulfillmentType === 'Shipping' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    order.fulfillmentType === 'POS' ? 'bg-green-50 text-green-600 border-green-200' :
                    'bg-orange-50 text-orange-600 border-orange-200'
                  }`}>
                    {order.fulfillmentType === 'Shipping' ? '📦 Shipping' : 
                     order.fulfillmentType === 'POS' ? '🏪 POS' : '🛍️ Pickup'}
                  </span>
                  <span className="text-stone-400 font-mono text-[10px]">#{order.id.slice(0, 8)}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none mb-1">
                  {order.customerName || "Walk-in Customer"}
                </h3>
                
                <div className="text-stone-500 font-medium text-sm mb-6 flex-grow">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <p key={item.id} className="border-b border-stone-50 py-1 last:border-0">
                        <span className="font-bold text-violet-600">{item.quantity}x</span> {item.product.name}
                      </p>
                    ))
                  ) : (
                    <p className="italic text-stone-300">No items listed</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  {order.status.toLowerCase() === "pending" && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, order.fulfillmentType)}
                      className="w-full py-4 bg-violet-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
                    >
                      Mark as {order.fulfillmentType === 'Shipping' ? 'Shipped' : 'Picked Up'}
                    </button>
                  )}
                  <button className="w-full py-3 border-2 border-stone-100 text-stone-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-stone-50 transition-all">
                    View Receipt
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-stone-100 rounded-[3rem]">
              <p className="text-stone-300 font-black uppercase tracking-widest">No {filter} Orders found</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}