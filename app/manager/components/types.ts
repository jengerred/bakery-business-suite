// app/manager/types.ts

export type ManagerOrder = {
  id: string;

  // Accounting
  subtotal: number;
  tax: number;
  total: number;

  // Payment
  paymentType: string;
  cardEntryMethod: string | null;
  cashTendered: number | null;
  changeGiven: number | null;
  stripePaymentId: string | null;

  // Customer
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  // Fulfillment
  status: string;
  fulfillmentType: string;
  pickupTime: string | null;
  fulfilledAt?: string;


  // Address
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  // Notes
  notes: string | null;

  // ⭐ Canonical backend timestamp
  createdAt: string;

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
