namespace BakeryBackend.Models
{
    public class OrderItem
    {
        public Product Product { get; set; } = new();
        public int Quantity { get; set; }
    }
}
