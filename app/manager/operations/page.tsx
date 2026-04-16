"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string; 
  customerName: string;
  total: number;
  status: string;           // "paid", "unpaid", "pending"
  fulfillmentType: string;  // "shipping", "pickup", "pos"
  createdAt: string;
  items: any[];
};

export default function OperationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error("Sync error:", err); }
  };

  useEffect(() => { loadOrders(); }, []);

  const filteredOrders = orders.filter((order) => {
    const s = order.status?.toLowerCase() || "";
    const t = order.fulfillmentType?.toLowerCase() || "";

    if (filter === "Pending Payment") return s === "unpaid" || s === "pending";
    if (filter === "Pending Pickup") return t === "pickup" && s === "paid";
    if (filter === "Pending Shipping") return t === "shipping" && s === "paid";
    if (filter === "POS") return t === "pos";
    if (filter === "Completed") return ["shipped", "pickedup", "completed"].includes(s);
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Command Center</h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">Veronica Bowen's Bakery Ops</p>
        </div>
        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300 overflow-x-auto max-w-full">
          {["Pending Payment", "Pending Pickup", "Pending Shipping", "POS", "Completed"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} className={`whitespace-nowrap px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filter === tab ? "bg-white text-violet-600 shadow-sm" : "text-stone-500"}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const s = order.status?.toLowerCase();
          const t = order.fulfillmentType?.toLowerCase();
          
          // 🎨 Visual Logic
          let statusLabel = "READY";
          let themeClass = "bg-violet-600"; 
          let subText = "Proceed with fulfillment";

          if (s === "unpaid" || s === "pending") {
            statusLabel = "HOLD: UNPAID";
            themeClass = "bg-red-600";
            subText = "Payment required before release";
          } else if (t === "pos") {
            statusLabel = "POS COMPLETED";
            themeClass = "bg-emerald-500";
            subText = "Transaction finalized at register";
          } else if (t === "pickup" && s === "paid") {
            statusLabel = "PAID PICKUP";
            themeClass = "bg-amber-500";
            subText = "Waiting for customer arrival";
          } else if (t === "shipping" && s === "paid") {
            statusLabel = "READY TO SHIP";
            themeClass = "bg-blue-600";
            subText = "Print label and pack items";
          }

          return (
            <div key={order.id} className="bg-white border-2 border-stone-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${themeClass} bg-opacity-10 text-opacity-100`} style={{color: 'inherit', borderColor: 'currentColor'}}>
                  {order.fulfillmentType || 'POS'}
                </span>
                <span className="text-stone-300 font-mono text-[10px]">#{order.id?.slice(0, 8)}</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none mb-4">{order.customerName || "Walk-in Guest"}</h3>
              
              <div className="flex-grow mb-6">
                 {order.items?.slice(0, expandedOrder === order.id ? 99 : 1).map((item, i) => (
                    <p key={i} className="text-sm font-bold text-stone-600 border-b border-stone-50 py-1">
                      <span className="text-violet-600">{item.quantity}x</span> {item.product.name}
                    </p>
                 ))}
                 {order.items?.length > 1 && expandedOrder !== order.id && (
                    <button onClick={() => setExpandedOrder(order.id)} className="text-[10px] text-stone-400 mt-2 font-bold uppercase underline">Show {order.items.length - 1} more items</button>
                 )}
              </div>

              <div className={`w-full p-4 rounded-2xl text-white mb-3 text-center transition-all ${themeClass}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{statusLabel}</p>
                <p className="text-[9px] opacity-80 font-bold leading-tight">{subText}</p>
              </div>

              <button 
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full py-3 border-2 border-stone-100 text-stone-400 font-black uppercase text-[10px] rounded-2xl hover:bg-stone-50"
              >
                {expandedOrder === order.id ? "Hide Details" : "View Details"}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}