"use client";

import { Suspense } from "react";
import POSPageContent from "./POSPageContent";

export default function POSPage() {
  return (
    <Suspense fallback={<div>Loading POS…</div>}>
      <POSPageContent />
    </Suspense>
  );
}
