using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BakeryBackend.Models
{
    [Table("Profiles")] // This tells EF to look for the Capital P table
    public class Profile
    {
        [Key]
        public Guid Id { get; set; }
        
        [Column("email")]
        public string? Email { get; set; }
        
        [Column("name")]
        public string? Name { get; set; }
        
        [Column("phone")]
        public string? Phone { get; set; }
        
        [Column("loyalty_points")]
        public int LoyaltyPoints { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("city")]
        public string? City { get; set; }
        
        [Column("zip")]
        public string? Zip { get; set; }

    }
}