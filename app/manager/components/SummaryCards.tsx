"use client";

/* -------------------------------------------------------
   📊 SummaryCards
   Displays the three core daily metrics:
   - Total sales
   - Total number of orders
   - Average order value

   This component is intentionally simple and purely presentational.
   All calculations are handled in useTodayOrders().
------------------------------------------------------- */
type Props = {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
};

export default function SummaryCards({
  totalSales,
  totalOrders,
  avgOrderValue,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Sales */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-sm text-emerald-500">Total Sales (Today)</h2>
        <p className="text-2xl text-emerald-500 font-semibold">${totalSales.toFixed(2)}</p>
      </div>

      {/* Total Orders */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-sm text-gray-500">Total Orders</h2>
        <p className="text-2xl font-semibold">{totalOrders}</p>
      </div>

      {/* Average Order Value */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-sm text-gray-500">Avg Order Value</h2>
        <p className="text-2xl font-semibold">${avgOrderValue.toFixed(2)}</p>
      </div>
    </div>
  );
}
