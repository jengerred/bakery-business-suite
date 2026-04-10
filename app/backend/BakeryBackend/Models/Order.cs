using System;
using System.Collections.Generic;

namespace BakeryBackend.Models
{
    public class Order
    {
        public Guid Id { get; set; }

        public List<OrderItem> Items { get; set; } = new();

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
    }
}
