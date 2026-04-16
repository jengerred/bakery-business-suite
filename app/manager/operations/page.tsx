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
};

export default function OperationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("Pending Pickup");
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
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Command Center</h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">Operations Dashboard</p>
        </div>
        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300 overflow-x-auto max-w-full">
          {["Pending Pickup", "Pending Shipping", "POS", "Completed"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} className={`whitespace-nowrap px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filter === tab ? "bg-white text-violet-600 shadow-sm" : "text-stone-500"}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {filter === "Pending Pickup" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-red-600 font-black uppercase tracking-widest text-xs mb-6 px-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Not Yet Paid
              </h2>
              <div className="space-y-6">
                {currentOrders.filter(o => o.status?.toLowerCase() === "unpaid" || o.status?.toLowerCase() === "pending").map(order => (
                  <OrderCard key={order.id} order={order} expandedOrder={expandedOrder} setExpandedOrder={setExpandedOrder} showPrice={true} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-6 px-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full" /> Paid & Ready
              </h2>
              <div className="space-y-6">
                {currentOrders.filter(o => o.status?.toLowerCase() === "paid").map(order => (
                  <OrderCard key={order.id} order={order} expandedOrder={expandedOrder} setExpandedOrder={setExpandedOrder} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.map(order => (
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

function OrderCard({ order, expandedOrder, setExpandedOrder, isArchivedView, showPrice }: any) {
  const s = order.status?.toLowerCase();
  const t = order.fulfillmentType?.toLowerCase();
  
  let themeClass = "bg-purple-600"; 
  if (t === "shipping") themeClass = "bg-blue-600"; 
  if (t === "pos" || s === "completed" || s === "pickedup" || s === "shipped") {
    themeClass = "bg-emerald-500"; 
  }
  
  const isUnpaid = s === "unpaid" || s === "pending";
  const isPOS = t === "pos";

  return (
    /* 🚀 The fix: Added group and hover classes to toggle opacity/grayscale */
    <div className={`group bg-white border-2 border-stone-200 rounded-[2.5rem] p-6 transition-all duration-300 
      ${isArchivedView 
        ? "opacity-40 grayscale-[0.6] hover:opacity-100 hover:grayscale-0 hover:shadow-xl hover:border-emerald-100" 
        : "shadow-sm hover:shadow-xl"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${themeClass}`}>
          {order.fulfillmentType || 'POS'}
        </span>
        <span className="text-stone-300 font-mono text-[10px]">#{order.id?.slice(0, 8)}</span>
      </div>

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{order.customerName || "Walk-in"}</h3>
        {showPrice && (
          <span className="text-red-600 font-black text-lg tracking-tighter">${order.total.toFixed(2)}</span>
        )}
      </div>
      
      <div className="mb-6">
         {order.items?.slice(0, expandedOrder === order.id ? 99 : 1).map((item: any, i: number) => (
            <p key={i} className="text-sm font-bold text-stone-600 py-1">
              <span className="text-violet-600">{item.quantity}x</span> {item.product.name}
            </p>
         ))}
      </div>

      <div className={`w-full p-4 rounded-2xl text-white mb-3 text-center transition-all ${isUnpaid ? "bg-red-600" : themeClass}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          {isUnpaid ? "HOLD: UNPAID" : (isPOS || s === "completed" || s === "pickedup" || s === "shipped") ? "COMPLETED" : "READY"}
        </p>
      </div>

      <button 
        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
        className="w-full py-3 border-2 border-stone-100 text-stone-400 font-black uppercase text-[10px] rounded-2xl hover:bg-stone-50 transition-colors"
      >
        {expandedOrder === order.id ? "Hide Details" : "View Details"}
      </button>
    </div>
  );
}