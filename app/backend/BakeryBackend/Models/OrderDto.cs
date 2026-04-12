using System.Collections.Generic;
using BakeryBackend.Models;


namespace BakeryBackend.Dtos
{
    public class OrderDto
    {
        public List<OrderItemDto> Items { get; set; } = new();

        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }

        public string PaymentType { get; set; } = string.Empty;
        public string? CardEntryMethod { get; set; }

        public decimal? CashTendered { get; set; }
        public decimal? ChangeGiven { get; set; }

        public string? StripePaymentId { get; set; }

        public long Timestamp { get; set; }

        public string? CustomerId { get; set; }
        public string? CustomerName { get; set; }

        public DateTime? PickupTime { get; set; }
        public string? Notes { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? FulfillmentType { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public string Status { get; set; } = "paid";
    }

    public class OrderItemDto
    {
        public Product Product { get; set; } = new();
        public int Quantity { get; set; }
    }
}
