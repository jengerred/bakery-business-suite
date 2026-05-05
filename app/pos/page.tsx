"use client";

import { Suspense } from "react";
import POSPageContent from "./POSPageContent";
import { useSearchParams } from "next/navigation";
import { StripeRedirectToast } from "./hooks/useStripeRedirectToast";
import Protected from "./Protected";

function POSPageInner() {
  const searchParams = useSearchParams();
  const pickupOrderId = searchParams.get("orderId") ?? undefined;

  return (
    <>
      <StripeRedirectToast />
      <POSPageContent pickupOrderId={pickupOrderId} />
    </>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div>Loading POS…</div>}>
       <Protected>
      <POSPageInner />
       </Protected>
    </Suspense>
  );
}
