import React from "react";
import type { ManagerOrder } from "../../../types/order";
import OrderDetails from "../../../components/OrderDetails";

export type FulfillmentCardProps = {
  order: ManagerOrder;
  variant: "pickup" | "shipping" | "delivery";
  expanded: boolean;
  onToggleExpand: () => void;
  primaryLabel: string;
  onPrimaryAction?: () => void;
  primaryDisabled?: boolean;
  onOpenModal: (order: ManagerOrder) => void;
};

export function FulfillmentCard({
  order,
  variant,
  expanded,
  onToggleExpand,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled,
  onOpenModal,
}: FulfillmentCardProps) {
  let themeClass = "bg-purple-600";
  if (variant === "shipping") themeClass = "bg-blue-600";
  if (variant === "delivery") themeClass = "bg-emerald-600";

  let borderClass = "border-purple-300";
  if (variant === "shipping") borderClass = "border-blue-300";
  if (variant === "delivery") borderClass = "border-emerald-300";

  return (
    <div
      onClick={() => onOpenModal(order)}
      className={`
        group bg-white rounded-2xl
        p-3 sm:p-4 md:p-5
        shadow-sm 
        transition-all duration-200
        border-2 ${borderClass}
        relative
        hover:shadow-lg
        hover:z-50
        hover:scale-[1.05]
        hover:-translate-y-1
        cursor-pointer
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <span
          className={`
            px-2 py-1 rounded-full
            text-[8px] sm:text-[9px] font-black uppercase text-white
            ${themeClass}
          `}
        >
          {order.fulfillmentType?.toUpperCase() || variant.toUpperCase()}
        </span>

        <span className="text-stone-300 font-mono text-[9px] sm:text-[10px]">
          #{order.id?.slice(0, 8)}
        </span>
      </div>

      {/* ID */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 uppercase italic leading-none">
          #{order.id.slice(-4).toUpperCase()}
        </h3>

        <span className="text-[9px] sm:text-[11px] text-stone-400 font-mono text-right">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Items */}
      <div className="mb-2 sm:mb-4">
        {order.items?.slice(0, expanded ? 99 : 1).map((item, i) => (
          <p key={i} className="text-xs sm:text-sm font-bold text-stone-600 py-0.5">
            <span className="text-violet-600">{item.quantity}x</span>{" "}
            {item.product?.name}
          </p>
        ))}

        {order.items && order.items.length > 1 && !expanded && (
          <p className="text-[9px] sm:text-[11px] text-stone-400 mt-1">
            + {order.items.length - 1} more item
            {order.items.length - 1 === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Shipping details */}
      {variant === "shipping" && (
        <div className="mb-2 sm:mb-3 text-[9px] sm:text-[11px] text-stone-500 space-y-1">
          <p>
            <span className="font-bold">Tracking:</span>{" "}
            {order.trackingNumber || "Not assigned"}
          </p>
          <p>
            <span className="font-bold">Carrier:</span>{" "}
            {order.shippingCarrier || "Not set"}
          </p>
        </div>
      )}

      {/* Primary action */}
      <button
        disabled={primaryDisabled || !onPrimaryAction}
        onClick={(e) => {
          e.stopPropagation();
          onPrimaryAction?.();
        }}
        className={`
          w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-2
          text-center transition-all font-black
          text-[8px] sm:text-[10px] uppercase tracking-[0.2em]
          ${
            primaryDisabled || !onPrimaryAction
              ? "bg-stone-300 cursor-default"
              : themeClass
          }
        `}
      >
        {primaryLabel}
      </button>

      {/* Expand button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="
          w-full py-1.5 sm:py-2 border-2 border-stone-100
          text-stone-400 font-black uppercase
          text-[8px] sm:text-[10px] rounded-xl sm:rounded-2xl
          hover:bg-stone-50 transition-colors
        "
      >
        {expanded ? "Hide Details" : "View Details"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 sm:mt-4">
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  );
}
