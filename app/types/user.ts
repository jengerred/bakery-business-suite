"use client";

/* ---------------------------------------------------------
   USER TYPE
   ---------------------------------------------------------
   Represents a user account in the bakery system.
   This model is used for:
     - POS employee login (future feature)
     - Online customer accounts (email + password)
     - Loyalty tracking across devices
     - Identifying users in both POS + Shop flows

   NOTE:
   - `Customer` = someone making a purchase at the bakery
   - `User`     = someone with an account in the system
                  (employee OR customer with login)
   --------------------------------------------------------- */

export type User = {
  id: string;               // Unique user ID from backend
  name?: string;            // Optional full name
  phone?: string;           // Optional phone number (POS lookup)
  email?: string;           // Optional email for login + receipts
  password?: string | null; // Optional hashed password (null for quick signups)
  loyaltyPoints: number;    // Loyalty balance for rewards system
};
