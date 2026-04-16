using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // Required for [Column]

namespace BakeryBackend.Models
{
    [Table("orders")] // Ensures it hits the correct table name
    public class Order
    {
        public Guid Id { get; set; }

        [Column("items")]
        public List<OrderItem> Items { get; set; } = new();

        [Column("subtotal")]
        public decimal Subtotal { get; set; }

        [Column("tax")]
        public decimal Tax { get; set; }

        [Column("total")]
        public decimal Total { get; set; }

        [Column("payment_type")]
        public string PaymentType { get; set; } = string.Empty;

        [Column("card_entry_method")]
        public string? CardEntryMethod { get; set; }

        [Column("cash_tendered")]
        public decimal? CashTendered { get; set; }

        [Column("change_given")]
        public decimal? ChangeGiven { get; set; }

        [Column("stripe_payment_id")]
        public string? StripePaymentId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        [Column("customer_id")]
        public string? CustomerId { get; set; }

        [Column("customer_name")]
        public string? CustomerName { get; set; }

        [Column("pickup_time")]
        public DateTime? PickupTime { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("customer_email")]
        public string? CustomerEmail { get; set; }

        [Column("customer_phone")]
        public string? CustomerPhone { get; set; }

        [Column("fulfillment_type")]
        public string? FulfillmentType { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("state")]
        public string? State { get; set; }

        [Column("zip")]
        public string? Zip { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending"; // pending, paid, shipped, pickedUp, cancelled

        [Column("TrackingNumber")]
        public string? TrackingNumber { get; set; } // Optional for shipping

        [Column("FulfilledAt")]
        public DateTime? FulfilledAt { get; set; }

    }
}