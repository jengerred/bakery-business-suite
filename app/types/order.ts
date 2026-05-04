// app/manager/types.ts

export type ManagerOrder = {
  id: string;

  /* -------------------------------------------------------
     ACCOUNTING
  -------------------------------------------------------- */
  subtotal: number;
  tax: number;
  total: number;

  /* -------------------------------------------------------
     PAYMENT
  -------------------------------------------------------- */
  paymentType: string;              // "cash" | "card" | "debit"
  cardEntryMethod: string | null;   // "manual" | "terminal" | null
  cashTendered: number | null;
  changeGiven: number | null;
  stripePaymentId: string | null;

  /* -------------------------------------------------------
     CUSTOMER
  -------------------------------------------------------- */
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  /* -------------------------------------------------------
     FULFILLMENT
  -------------------------------------------------------- */
  status: string;                   // "pending", "paid", "ready", "pickedUp", "completed", etc.
  fulfillmentType: string;          // "POS", "pickup", "shipping", "delivery"

  pickupTime: string | null;        // ISO timestamp
  fulfilledAt?: string;             // ISO timestamp

  // ⭐ Shipping-specific fields
  shippingCarrier?: string | null;  // "UPS", "USPS", "FedEx", etc.
  trackingNumber?: string | null;
  labelUrl?: string | null;         // URL to generated shipping label

  // ⭐ Delivery-specific fields
  courierName?: string | null;      // Uber/Lyft courier name
  courierPhone?: string | null;
  deliveryEta?: string | null;      // Estimated delivery time
  deliveredAt?: string | null;      // ISO timestamp

  /* -------------------------------------------------------
     ADDRESS (Shipping + Delivery)
  -------------------------------------------------------- */
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  /* -------------------------------------------------------
     NOTES
  -------------------------------------------------------- */
  notes: string | null;

  /* -------------------------------------------------------
     TIMESTAMPS
  -------------------------------------------------------- */
  createdAt: string;                // canonical backend timestamp

  /* -------------------------------------------------------
     ITEMS
  -------------------------------------------------------- */
  items: {
    product: {
      id: number;
      name: string;
      price: number;
      description: string;
      imageUrl: string;
      sortOrder: number;
    };
    quantity: number;
  }[];
};
