"use client";

/* -------------------------------------------------------
   🧺 Product Data
   Static product list + Product type.
------------------------------------------------------- */
import { products } from "@/app/pos/lib/products";
import { Product } from "@/app/pos/lib/products";

/* -------------------------------------------------------
   🧱 ProductList
   Displays all available products with an "Add" button.
   Used inside ProductListSection.
------------------------------------------------------- */
type ProductListProps = {
  onAdd: (product: Product) => void; // Add product to cart
};

export default function ProductList({ onAdd }: ProductListProps) {
  return (
    <div className="space-y-4">

      {/* -------------------------------------------------------
         🛒 PRODUCT CARDS
         Each product shows:
         - Name
         - Price
         - Add button
      ------------------------------------------------------- */}
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
        >
          {/* Product name + price */}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-500">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Add to cart */}
          <button
            onClick={() => onAdd(product)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
}
