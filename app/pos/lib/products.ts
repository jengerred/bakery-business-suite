/* -------------------------------------------------------
   🧾 Product Type
   Represents a single sellable item in the POS.
------------------------------------------------------- */
export type Product = {
  id: number;    // Unique identifier for the product
  name: string;  // Display name shown in the UI
  price: number; // Unit price in dollars
};

/* -------------------------------------------------------
   🧺 Available Products
   Static catalog used by the POS product list.

   NOTE:
   - This is mock data for the POS demo.
   - In a real system, products would come from a database
     or an API endpoint.
------------------------------------------------------- */
export const products: Product[] = [
  { id: 1, name: "Chocolate Chip Cookies", price: 2.5 },
  { id: 2, name: "Brownies", price: 3.0 },
  { id: 3, name: "Peanut Butter Cookies", price: 2.75 },
];
