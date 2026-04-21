"use client";

import { Suspense } from "react";
import POSPageContent from "./POSPageContent";
import { useSearchParams } from "next/navigation";

export default function POSPage() {
  const searchParams = useSearchParams();
  const pickupOrderId = searchParams.get("orderId") ?? undefined;

  return (
    <Suspense fallback={<div>Loading POS…</div>}>
      <POSPageContent pickupOrderId={pickupOrderId} />
    </Suspense>
  );
}
