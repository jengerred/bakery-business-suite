using System.ComponentModel.DataAnnotations.Schema;

namespace BakeryBackend.Models
{
    /* ---------------------------------------------------------
       PRODUCT ENTITY (EF Core Model)
       ---------------------------------------------------------
       This class maps directly to the `products` table in the
       database. EF Core uses this model for:

         - Querying products
         - CRUD operations
         - Mapping C# properties to DB columns
         - Returning JSON to the frontend

       NOTE:
       - `image_url` and `sort_order` are mapped using attributes
         because the database uses snake_case.
       --------------------------------------------------------- */

    public class Product
    {
        public int Id { get; set; }                  // Primary key

        public string Name { get; set; } = string.Empty;
        // Full display name (e.g., "Brownie - Single")

        public decimal Price { get; set; }           // Price in dollars

        public string? Description { get; set; }     // Optional description

        [Column("image_url")]
        public string? ImageUrl { get; set; }        // Mapped from DB column

        [Column("sort_order")]
        public short SortOrder { get; set; }         // Controls display order

        public int StockQuantity { get; set; }
        public bool TrackInventory { get; set; }
    }
}
