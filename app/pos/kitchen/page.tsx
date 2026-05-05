"use client";

import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { FulfillmentCard } from "./components/FulfillmentCard";
import POSNav from "../components/POSNav";  

export default function OperationsPage() {
  /* -------------------------------------------------------
     STATE
  -------------------------------------------------------- */
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [needsPickupOpen, setNeedsPickupOpen] = useState(false);
  const [needsShippingOpen, setNeedsShippingOpen] = useState(false);
  const [needsDeliveryOpen, setNeedsDeliveryOpen] = useState(false);

  const [readyPickupOpen, setReadyPickupOpen] = useState(false);
  const [readyShippingOpen, setReadyShippingOpen] = useState(false);
  const [readyDeliveryOpen, setReadyDeliveryOpen] = useState(false);

  const [filledOpen, setFilledOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState<any | null>(null);

  /* -------------------------------------------------------
     UNIFIED ORDER ENGINE
  -------------------------------------------------------- */
  const {
    loading,
    byFulfillment,
    refresh,
  } = useOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center font-sans text-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  /* -------------------------------------------------------
     FULFILLMENT GROUPS (from useOrders)
  -------------------------------------------------------- */
  const needsPickup = byFulfillment.pickup.needs;
  const needsShipping = byFulfillment.shipping.needs;
  const needsDelivery = byFulfillment.delivery.needs;

  const readyForPickup = byFulfillment.pickup.ready;
  const readyToShip = byFulfillment.shipping.readyToShip;
  const readyForDelivery = byFulfillment.delivery.ready;

  const filledTotal =
    readyForPickup.length +
    readyToShip.length +
    readyForDelivery.length;

  /* -------------------------------------------------------
     UPDATE HANDLERS (unchanged)
  -------------------------------------------------------- */
  const updateOrder = async (id: string, payload: Record<string, any>) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      refresh();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleMarkReadyPickup = (order: any) => {
    updateOrder(order.id, {
      status: "Ready",
      fulfilledAt: new Date().toISOString(),
    });
  };

  const handleMarkReadyShipping = (order: any) => {
    updateOrder(order.id, { status: "Ready" });
  };

  const handleMarkShipped = (order: any) => {
    updateOrder(order.id, { fulfilledAt: new Date().toISOString() });
  };

  /* -------------------------------------------------------
     UI (UNCHANGED)
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-violet-100 p-8 font-sans text-slate-900">
      <div className="-mt-6">
       <POSNav active="kitchen" />
       </div>
      <header className="mt-4 max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Kitchen - Operations
          </h1>
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mt-2">
            Fulfillment Dashboard
          </p>
        </div>

        <div className="text-[11px] text-stone-500 uppercase tracking-[0.2em] font-black">
          Fulfillment Only · No POS · No Payments
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-0 md:space-y-6">

        {/* -------------------------------------------------------
           NEEDS FULFILLMENT
        -------------------------------------------------------- */}
        <section className="border -m-5 mb-4 md:mb-3 lg:mb-4 md:m-1 lg:m-1 rounded-3xl px-3 md:px-5 py-4 shadow-sm border-red-600 bg-amber-50">
          <div className="text-left mb-4">
            <h2 className="text-md font-black uppercase tracking-[0.2em] text-red-700">
              ⚠️ Needs Fulfillment
            </h2>
            <p className="text-xs italic text-slate-500 mt-1 ml-8">
              ~ Orders that still need to be filled ~
            </p>
          </div>

          <div className="space-y-4">

            {/* PICKUP */}
            <SubSection
              title="Pickup"
              count={needsPickup.length}
              colorDotClass="bg-purple-500"
              colorClass="border-purple-300 bg-purple-50"
              open={needsPickupOpen}
              onToggle={() => setNeedsPickupOpen((o) => !o)}
              titleColorClass="text-purple-700"
            >
              {needsPickup.length === 0 ? (
                <EmptyState label="No pickup orders need fulfillment." />
              ) : (
                <OrderGrid
                  orders={needsPickup}
                  expandedOrderId={expandedOrderId}
                  setExpandedOrderId={setExpandedOrderId}
                  variant="pickup"
                  primaryLabel="Mark Ready"
                  onPrimaryAction={handleMarkReadyPickup}
                  setModalOrder={setModalOrder}
                />
              )}
            </SubSection>

            {/* SHIPPING */}
            <SubSection
              title="Shipping"
              count={needsShipping.length}
              colorDotClass="bg-blue-500"
              colorClass="border-blue-300 bg-blue-100/80"
              open={needsShippingOpen}
              onToggle={() => setNeedsShippingOpen((o) => !o)}
              titleColorClass="text-blue-700"
            >
              {needsShipping.length === 0 ? (
                <EmptyState label="No shipping orders need fulfillment." />
              ) : (
                <OrderGrid
                  orders={needsShipping}
                  expandedOrderId={expandedOrderId}
                  setExpandedOrderId={setExpandedOrderId}
                  variant="shipping"
                  primaryLabel="Mark Ready"
                  onPrimaryAction={handleMarkReadyShipping}
                  setModalOrder={setModalOrder}
                />
              )}
            </SubSection>

            {/* DELIVERY */}
            <SubSection
              title="Delivery"
              count={needsDelivery.length}
              colorDotClass="bg-orange-500"
              colorClass="border-orange-500 bg-orange-200/50"
              open={needsDeliveryOpen}
              onToggle={() => setNeedsDeliveryOpen((o) => !o)}
              titleColorClass="text-orange-700"
            >
              <EmptyState label="Delivery workflow coming soon." />
            </SubSection>

          </div>
        </section>

        {/* -------------------------------------------------------
           FILLED ORDERS
        -------------------------------------------------------- */}
        <div className="-m-5 mb-4 mt-2 md:mb-3 lg:mb-4 md:m-1 lg:m-1">
          <Section
            title="Filled Orders"
            subtitle="Orders that are ready for pickup, shipping, or delivery"
            colorClass="border-green-400 bg-emerald-50"
            colorDotClass=""
            open={filledOpen}
            onToggle={() => setFilledOpen((o) => !o)}
            titleSize="md"
            count={filledTotal}
            titleColorClass="text-green-700"
          >

            {/* READY FOR PICKUP */}
            <Section
              title="Ready for Pickup"
              subtitle="Orders that are filled and waiting for customers"
              colorClass="border-purple-300 bg-purple-100/70"
              colorDotClass="bg-purple-500"
              open={readyPickupOpen}
              onToggle={() => setReadyPickupOpen((o) => !o)}
              titleSize="sm"
              count={readyForPickup.length}
              titleColorClass="text-purple-700"
            >
              <OrderGrid
                orders={readyForPickup}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
                variant="pickup"
                primaryLabel="Ready"
                primaryDisabled
                setModalOrder={setModalOrder}
              />
            </Section>

            {/* READY TO SHIP */}
            <Section
              title="Ready to Pack"
              subtitle="Packed, labeled, and waiting to be handed to the carrier"
              colorClass="border-blue-300 bg-blue-100/50"
              colorDotClass="bg-blue-500"
              open={readyShippingOpen}
              onToggle={() => setReadyShippingOpen((o) => !o)}
              count={readyToShip.length}
              titleColorClass="text-blue-700"
            >
              <OrderGrid
                orders={readyToShip}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
                variant="shipping"
                primaryLabel="Mark Shipped"
                onPrimaryAction={handleMarkShipped}
                setModalOrder={setModalOrder}
              />
            </Section>

            {/* READY FOR DELIVERY */}
            <Section
              title="Ready for Delivery"
              subtitle="Orders out for delivery or ready for dispatch"
              colorClass="border-orange-500 bg-orange-100/50"
              colorDotClass="bg-orange-500"
              open={readyDeliveryOpen}
              onToggle={() => setReadyDeliveryOpen((o) => !o)}
              count={readyForDelivery.length}
              titleColorClass="text-orange-700"
            >
              <OrderGrid
                orders={readyForDelivery}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
                variant="delivery"
                primaryLabel="Out for Delivery"
                primaryDisabled
                setModalOrder={setModalOrder}
              />
            </Section>

          </Section>
        </div>

        {/* -------------------------------------------------------
           MODAL
        -------------------------------------------------------- */}
        {modalOrder && (
          <Modal order={modalOrder} onClose={() => setModalOrder(null)} />
        )}

      </main>
    </div>
  );
}

/* -------------------------------------------------------
   SMALL COMPONENTS (UNCHANGED)
-------------------------------------------------------- */

function OrderGrid({
  orders,
  expandedOrderId,
  setExpandedOrderId,
  variant,
  primaryLabel,
  primaryDisabled,
  onPrimaryAction,
  setModalOrder,
}: any) {
  return (
    <div className="max-h-[600px] overflow-y-auto pt-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {orders.map((order: any) => (
          <FulfillmentCard
            key={order.id}
            order={order}
            variant={variant}
            expanded={expandedOrderId === order.id}
            onToggleExpand={() =>
              setExpandedOrderId((id: any) => (id === order.id ? null : order.id))
            }
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled}
            onPrimaryAction={
              onPrimaryAction ? () => onPrimaryAction(order) : undefined
            }
            onOpenModal={(order: any) => setModalOrder(order)}
          />
        ))}
      </div>
    </div>
  );
}

function Modal({ order, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-[90%] max-w-lg shadow-xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-black mb-4 text-slate-900">
          Order #{order.id.slice(-4).toUpperCase()}
        </h2>

        <div className="space-y-2 mb-4">
          {order.items.map((item: any, i: number) => (
            <p key={i} className="text-sm font-bold text-stone-700">
              <span className="text-violet-600">{item.quantity}x</span>{" "}
              {item.product.name}
            </p>
          ))}
        </div>

        <p className="text-sm text-stone-600 mb-2">
          <span className="font-bold">Status:</span> {order.status}
        </p>

        <p className="text-sm text-stone-600">
          <span className="font-bold">Created:</span>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function Section(props: any) {
  return (
    <section
      className={`border rounded-3xl px-5 py-4 mb-4 shadow-sm transition-all ${props.colorClass}`}
    >
      <button
        type="button"
        onClick={props.onToggle}
        className="w-full flex items-center justify-between gap-4"
      >
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-black text-xl leading-none">
              ✓
            </span>
            <span className={`w-2 h-2 rounded-full ${props.colorDotClass}`} />
            <span
              className={`${
                props.titleSize === "lg"
                  ? "text-xl"
                  : props.titleSize === "md"
                  ? "text-base"
                  : "text-xs"
              } font-black uppercase tracking-[0.2em] ${
                props.titleColorClass ?? "text-slate-800"
              }`}
            >
              {props.title}
            </span>
            {typeof props.count === "number" && (
              <span className="text-xs text-green-700 font-mono">
                ({props.count} order{props.count === 1 ? "" : "s"})
              </span>
            )}
          </div>

          {props.subtitle && (
            <span className="text-xs italic text-stone-500 mt-1 ml-8">
              ~ {props.subtitle} ~
            </span>
          )}
        </div>

        <Chevron open={props.open} />
      </button>

      {props.open && <div className="mt-4">{props.children}</div>}
    </section>
  );
}

function SubSection(props: any) {
  return (
    <div className={`border rounded-2xl ${props.colorClass}`}>
      <button
        type="button"
        onClick={props.onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${props.colorDotClass}`} />
          <span
            className={`text-sm font-black uppercase tracking-[0.2em] ${
              props.titleColorClass ?? "text-slate-700"
            }`}
          >
            {props.title}
          </span>
          <span className="text-xs text-red-700 font-mono">
            ({props.count} order{props.count === 1 ? "" : "s"})
          </span>
        </div>

        <Chevron open={props.open} />
      </button>

      {props.open && <div className="px-4 pb-4 pt-1">{props.children}</div>}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`transition-transform duration-200 text-stone-400 ${
        open ? "rotate-180" : "rotate-0"
      }`}
    >
      ▼
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-xs text-stone-400 italic py-3 px-1">{label}</div>
  );
}
