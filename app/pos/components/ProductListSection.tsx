"use client";

/* -------------------------------------------------------
   🧺 Product Type
   Used to type the onAdd callback.
------------------------------------------------------- */
import type { Product } from "../lib/products";

/* -------------------------------------------------------
   🧱 Components
   ProductList renders the actual list of products.
------------------------------------------------------- */
import ProductList from "./ProductList";

/* -------------------------------------------------------
   🗂️ ProductListSection
   A simple wrapper section that:
   - Adds a styled container
   - Adds a header
   - Passes the onAdd callback to ProductList
------------------------------------------------------- */
type ProductListSectionProps = {
  onAdd: (product: Product) => void; // Add product to cart
};

export default function ProductListSection({ onAdd }: ProductListSectionProps) {
  return (
    <section className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Products</h2>

      {/* Product list with Add buttons */}
      <ProductList onAdd={onAdd} />
    </section>
  );
}
