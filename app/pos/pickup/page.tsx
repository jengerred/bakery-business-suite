"use client";

import PickupOrdersTab from "./components/PickupOrdersTab";
import Protected from "../Protected";

export default function PickupOrdersPage() {
  return 
  <Protected>
    <PickupOrdersTab />
  </Protected>;
}
