"use client";

/* ---------------------------------------------------------
   PRODUCT TYPE
   ---------------------------------------------------------
   This model represents a sellable product in the bakery
   system. It is used across:

     - Shop (customer-facing menu)
     - POS (cashier-facing order entry)
     - Cart + checkout flows
     - Product options modal
     - Order submission (future feature)

   The fields mirror the backend Product model and the
   Supabase `products` table, with the backend mapping
   `image_url` → `imageUrl` for frontend JSON.
   --------------------------------------------------------- */

export type Product = {
  id: number;             // Unique product ID from backend
  name: string;           // Full product name (e.g., "Brownie - Single")
  price: number;          // Base price for this product
  description?: string;   // Optional description for Shop UI
  imageUrl?: string;      // Product image (mapped from `image_url`)
  sortOrder: number;      // Controls display order in Shop + POS
  taxable: boolean;       // Michigan tax flag (bakery items = false)
};
