using System.ComponentModel.DataAnnotations.Schema;


namespace BakeryBackend.Models
{
    public class Product
    {
        public int Id { get; set; }              // Primary key
        public string Name { get; set; } = string.Empty;
        // Display name
        public decimal Price { get; set; }       // Price in dollars
        
        public string? Description { get; set; }  

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("sort_order")]
        public short SortOrder { get; set; }   // short = int2

    
    }
}
