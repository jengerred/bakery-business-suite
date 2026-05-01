"use client";

import { useEffect, useState, useRef } from "react";
import { FulfillmentCard } from "./components/FulfillmentCard";

type Order = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  fulfillmentType: string;
  createdAt: string;
  items: {
    quantity: number;
    product: { name: string };
  }[];
  shippingCarrier?: string;
  trackingNumber?: string;
  labelUrl?: string;
  fulfilledAt?: string;
  customerEmail?: string;
  customerPhone?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OperationsPage() {
  /* -------------------------------------------------------
     STATE & REFS (Aligned with RecentOrders.tsx)
  -------------------------------------------------------- */
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const previousRef = useRef<string>("");

  // Collapsibles 
  const [needsPickupOpen, setNeedsPickupOpen] = useState(false);
  const [needsShippingOpen, setNeedsShippingOpen] = useState(false);
  const [needsDeliveryOpen, setNeedsDeliveryOpen] = useState(false);

  const [readyPickupOpen, setReadyPickupOpen] = useState(false);
  const [readyShippingOpen, setReadyShippingOpen] = useState(false);
  const [readyDeliveryOpen, setReadyDeliveryOpen] = useState(false);
  const [filledOpen, setFilledOpen] = useState(false);
  
  const [modalOrder, setModalOrder] = useState<Order | null>(null);

  /* -------------------------------------------------------
     REAL-TIME AUTO-REFRESH
  -------------------------------------------------------- */
  const loadAllOrders = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();

      // Only update if data has actually changed (RecentOrders logic)
      const newJson = JSON.stringify(data);
      if (newJson !== previousRef.current) {
        setOrders(data);
        previousRef.current = newJson;
      }
    } catch (err) {
      console.error("Live orders load error:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  /* -------------------------------------------------------
     OPERATIONS ACTIONS
  -------------------------------------------------------- */
  const updateOrder = async (id: string, payload: Record<string, any>) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh immediately after update without spinner
        await loadAllOrders(false);
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  useEffect(() => {
    loadAllOrders(true); // First load shows spinner
    const interval = setInterval(() => loadAllOrders(false), 3000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     FILTERS
  -------------------------------------------------------- */
  const needsPickup = orders.filter((o) => {
    const t = o.fulfillmentType?.toLowerCase();
    const s = o.status?.toLowerCase();
    return t === "pickup" && !["ready", "pickedup", "completed"].includes(s);
  });

  const needsShipping = orders.filter((o) => {
    const t = o.fulfillmentType?.toLowerCase();
    const s = o.status?.toLowerCase();
    return t === "shipping" && !o.fulfilledAt && !o.trackingNumber && s !== "ready";
  });

  const needsDelivery = orders.filter((o) => {
    const t = o.fulfillmentType?.toLowerCase();
    const s = o.status?.toLowerCase();
    return t === "delivery" && s === "pending";
  });

  const readyForPickup = orders.filter((o) => 
    o.fulfillmentType?.toLowerCase() === "pickup" && o.status?.toLowerCase() === "ready"
  );

  const readyToShip = orders.filter((o) => 
    o.fulfillmentType?.toLowerCase() === "shipping" && o.trackingNumber && !o.fulfilledAt
  );

  const readyForDelivery = orders.filter((o) => 
    o.fulfillmentType?.toLowerCase() === "delivery" && o.status?.toLowerCase() === "ready"
  );

  /* -------------------------------------------------------
     HANDLERS
  -------------------------------------------------------- */
  const handleMarkReadyPickup = (order: Order) => {
    updateOrder(order.id, { status: "Ready", fulfilledAt: new Date().toISOString() });
  };

  const handleMarkReadyShipping = (order: Order) => {
    updateOrder(order.id, { status: "Ready" });
  };

  const handleMarkShipped = (order: Order) => {
    updateOrder(order.id, { fulfilledAt: new Date().toISOString() });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center font-sans text-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50 p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Operations</h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">Fulfillment Dashboard</p>
        </div>
        <div className="text-[11px] text-stone-500 uppercase tracking-[0.2em] font-black">
          Fulfillment Only · No POS · No Payments
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-0 md:space-y-6">
        {/* Needs Fulfillment Section */}
        <section className="border -m-5 mb-4 md:mb-3 lg:mb-4 md:m-1 lg:m-1 rounded-3xl px-3 md:px-5 py-4 shadow-sm border-red-600 bg-amber-50">
          <div className="text-left mb-4">
            <h2 className="text-md font-black uppercase tracking-[0.2em] text-slate-800">⚠️ Needs Fulfillment</h2>
            <p className="text-xs text-stone-500 mt-1">Orders that still need to be filled</p>
          </div>

          <div className="space-y-4">
            <SubSection
              title="Pickup"
              count={needsPickup.length}
              colorDotClass="bg-purple-500"
              colorClass="border-purple-300 bg-purple-50"
              open={needsPickupOpen}
              onToggle={() => setNeedsPickupOpen((o) => !o)}
            >
              {needsPickup.length === 0 ? <EmptyState label="No pickup orders need fulfillment." /> : (
                <div className="max-h-[600px] overflow-y-auto pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {needsPickup.map((order) => (
                      <FulfillmentCard
                        key={order.id}
                        order={order}
                        variant="pickup"
                        expanded={expandedOrderId === order.id}
                        onToggleExpand={() => setExpandedOrderId(id => id === order.id ? null : order.id)}
                        primaryLabel="Mark Ready"
                        onPrimaryAction={() => handleMarkReadyPickup(order)}
                        onOpenModal={(order) => setModalOrder(order)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </SubSection>

            <SubSection
              title="Shipping"
              count={needsShipping.length}
              colorDotClass="bg-blue-500"
              colorClass="border-blue-300 bg-blue-100/80"
              open={needsShippingOpen}
              onToggle={() => setNeedsShippingOpen((o) => !o)}
            >
              {needsShipping.length === 0 ? <EmptyState label="No shipping orders need fulfillment." /> : (
                <div className="max-h-[600px] overflow-y-auto pt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {needsShipping.map((order) => (
                      <FulfillmentCard
                        key={order.id}
                        order={order}
                        variant="shipping"
                        expanded={expandedOrderId === order.id}
                        onToggleExpand={() => setExpandedOrderId(id => id === order.id ? null : order.id)}
                        primaryLabel="Mark Ready"
                        onPrimaryAction={() => handleMarkReadyShipping(order)}
                        onOpenModal={(order) => setModalOrder(order)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </SubSection>

            <SubSection
              title="Delivery"
              count={needsDelivery.length}
              colorDotClass="bg-orange-500"
              colorClass="border-orange-500 bg-orange-200/50"
              open={needsDeliveryOpen}
              onToggle={() => setNeedsDeliveryOpen((o) => !o)}
            >
              <EmptyState label="Delivery workflow coming soon." />
            </SubSection>
          </div>
        </section>

        {/* Filled Orders Section */}
        <div className="-m-5 mb-4 mt-2 md:mb-3 lg:mb-4 md:m-1 lg:m-1">
          <Section
            title="Filled Orders"
            subtitle="Orders that are ready for pickup, shipping, or delivery"
            colorClass="border-green-400 bg-emerald-50"
            colorDotClass=""
            open={filledOpen}
            onToggle={() => setFilledOpen((o) => !o)}
            titleSize="md"
          >
            <div className="mb-2">
              <Section
                title="Ready for Pickup"
                subtitle="Orders that are filled and waiting for customers"
                colorClass="border-purple-300 bg-purple-100/70"
                colorDotClass="bg-purple-500"
                open={readyPickupOpen}
                onToggle={() => setReadyPickupOpen((o) => !o)}
                titleSize="sm"
              >
                {readyForPickup.length === 0 ? <EmptyState label="No pickup orders are ready yet." /> : (
                  <div className="max-h-[600px] overflow-y-auto pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {readyForPickup.map((order) => (
                        <FulfillmentCard
                          key={order.id}
                          order={order}
                          variant="pickup"
                          expanded={expandedOrderId === order.id}
                          onToggleExpand={() => setExpandedOrderId(id => id === order.id ? null : order.id)}
                          primaryLabel="Ready"
                          primaryDisabled
                          onOpenModal={(order) => setModalOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>

            <div className="mb-2">
              <Section
                title="Ready to Pack"
                subtitle="Packed, labeled, and waiting to be handed to the carrier"
                colorClass="border-blue-300 bg-blue-100/50"
                colorDotClass="bg-blue-500"
                open={readyShippingOpen}
                onToggle={() => setReadyShippingOpen((o) => !o)}
              >
                {readyToShip.length === 0 ? <EmptyState label="No shipping orders are ready to ship." /> : (
                  <div className="max-h-[600px] overflow-y-auto pr-1 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {readyToShip.map((order) => (
                        <FulfillmentCard
                          key={order.id}
                          order={order}
                          variant="shipping"
                          expanded={expandedOrderId === order.id}
                          onToggleExpand={() => setExpandedOrderId(id => id === order.id ? null : order.id)}
                          primaryLabel="Mark Shipped"
                          onPrimaryAction={() => handleMarkShipped(order)}
                          onOpenModal={(order) => setModalOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>

            <div className="mb-2">
              <Section
                title="Ready for Delivery"
                subtitle="Orders out for delivery or ready for dispatch"
                colorClass="border-orange-500 bg-orange-100/50"
                colorDotClass="bg-orange-500"
                open={readyDeliveryOpen}
                onToggle={() => setReadyDeliveryOpen((o) => !o)}
              >
                {readyForDelivery.length === 0 ? <EmptyState label="No delivery orders are ready yet." /> : (
                  <div className="max-h-[600px] overflow-y-auto pr-1 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {readyForDelivery.map((order) => (
                        <FulfillmentCard
                          key={order.id}
                          order={order}
                          variant="delivery"
                          expanded={expandedOrderId === order.id}
                          onToggleExpand={() => setExpandedOrderId(id => id === order.id ? null : order.id)}
                          primaryLabel="Out for Delivery"
                          primaryDisabled
                          onOpenModal={(order) => setModalOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>
          </Section>
        </div>

        {modalOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 w-[90%] max-w-lg shadow-xl relative text-slate-900">
              <button onClick={() => setModalOrder(null)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-xl">✕</button>
              <h2 className="text-xl font-black mb-4 text-slate-900">Order #{modalOrder.id.slice(-4).toUpperCase()}</h2>
              <div className="space-y-2 mb-4">
                {modalOrder.items.map((item, i) => (
                  <p key={i} className="text-sm font-bold text-stone-700">
                    <span className="text-violet-600">{item.quantity}x</span> {item.product.name}
                  </p>
                ))}
              </div>
              <p className="text-sm text-stone-600 mb-2"><span className="font-bold">Status:</span> {modalOrder.status}</p>
              <p className="text-sm text-stone-600"><span className="font-bold">Created:</span> {new Date(modalOrder.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTS
-------------------------------------------------------- */

type SectionProps = {
  title: string;
  subtitle?: string;
  colorClass: string;
  open: boolean;
  colorDotClass: string;
  onToggle?: () => void;
  titleSize?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

function Section({ title, subtitle, colorClass, titleSize, open, colorDotClass, onToggle, children }: SectionProps) {
  const sizeClass = titleSize === "lg" ? "text-xl" : titleSize === "md" ? "text-base" : "text-xs";
  return (
    <section className={`border rounded-3xl px-5 py-4 shadow-sm transition-all ${colorClass}`}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-left">
          <span className="text-emerald-500 font-black text-xl leading-none">✓</span>
          <span className={`w-2 h-2 rounded-full ${colorDotClass}`} />
          <span className={`${sizeClass} font-black uppercase tracking-[0.2em] text-slate-800`}>{title}</span>
          {subtitle && <span className="text-xs text-stone-500 mt-1">{subtitle}</span>}
        </div>
        <Chevron open={open} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

type SubSectionProps = {
  title: string;
  count: number;
  colorDotClass: string;
  colorClass: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function SubSection({ title, count, colorDotClass, colorClass, open, onToggle, children }: SubSectionProps) {
  return (
    <div className={`border rounded-2xl ${colorClass}`}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colorDotClass}`} />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">{title}</span>
          <span className="text-xs text-red-700 font-mono">({count} order{count === 1 ? "" : "s"})</span>
        </div>
        <Chevron open={open} />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return <span className={`transition-transform duration-200 text-stone-400 ${open ? "rotate-180" : "rotate-0"}`}>▼</span>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-xs text-stone-400 italic py-3 px-1">{label}</div>;
}