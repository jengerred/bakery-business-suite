using System.ComponentModel.DataAnnotations.Schema;

namespace BakeryBackend.Models
{
    /* ---------------------------------------------------------
       PRODUCT DTO (Data Transfer Object)
       ---------------------------------------------------------
       This class defines the shape of product data that the
       API accepts from clients (POST/PUT requests).

       Why use a DTO?
         - Prevents overposting attacks
         - Allows different input vs output shapes
         - Keeps API stable even if the model changes
         - Lets you hide fields from clients (e.g., inventory)

       Currently mirrors Product, but intentionally separate.
       --------------------------------------------------------- */

    public class ProductDto
    {
        public int Id { get; set; }                  // Optional for updates

        public string Name { get; set; } = string.Empty;
        // Display name

        public decimal Price { get; set; }           // Price in dollars

        public string? Description { get; set; }     // Optional description

        [Column("image_url")]
        public string? ImageUrl { get; set; }        // Optional image

        [Column("sort_order")]
        public short SortOrder { get; set; }         // Optional ordering
    }
}
