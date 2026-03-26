"use client";

/* -------------------------------------------------------
   💳 PaymentBreakdown
   Displays today's sales split by payment type:
   - Cash sales
   - Card sales (credit + debit)

   This component is purely presentational.
   All calculations are handled in useTodayOrders().
------------------------------------------------------- */
type Props = {
  cashSales: number;
  cardSales: number;
};

export default function PaymentBreakdown({ cashSales, cardSales }: Props) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-2">Payment Breakdown</h2>

      {/* Cash total */}
      <p>Cash: ${cashSales.toFixed(2)}</p>

      {/* Card total (credit + debit combined) */}
      <p>Card: ${cardSales.toFixed(2)}</p>
    </div>
  );
}
