"use client";

/* ---------------------------------------------------------
   CUSTOMER TYPE
   ---------------------------------------------------------
   This model represents a customer in the bakery system.
   It is used across:
     - POS (attaching customers to orders)
     - Loyalty system (tracking points)
     - Customer lookup (phone/email search)
     - Order history (future feature)
   --------------------------------------------------------- */

export type Customer = {
  id: string;             // Unique customer ID (from backend)
  name: string;           // Customer's full name
  phone: string;          // Primary identifier for lookup at POS
  email?: string;         // Optional email for receipts + online login
  loyaltyPoints?: number; // Optional loyalty balance (if enabled)
};
