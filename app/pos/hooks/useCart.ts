/* -------------------------------------------------------
   🪝 useCart (Re‑Export)
   Convenience re-export so components can import:

       import { useCart } from "@/app/pos/hooks/useCart";

   instead of reaching into the context folder directly.

   NOTE:
   - This file intentionally stays tiny.
   - It keeps your import paths clean and consistent.
------------------------------------------------------- */

export { useCartContext as useCart } from "../context/CartContext";
