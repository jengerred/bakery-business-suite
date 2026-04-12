using Microsoft.EntityFrameworkCore;
using BakeryBackend.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace BakeryBackend.Data
{
    /* ---------------------------------------------------------
       BAKERY CONTEXT (Entity Framework Core)
       ---------------------------------------------------------
       Updated to handle JSONB serialization for Order Items and
       ensure compatibility with Supabase/PostgreSQL naming.
    --------------------------------------------------------- */

    public class BakeryContext : DbContext
    {
        public BakeryContext(DbContextOptions<BakeryContext> options)
            : base(options) {}

        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Setup JSON serialization options
            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            // Value Converter: Transforms List<OrderItem> <-> JSON String
            var itemsConverter = new ValueConverter<List<OrderItem>, string>(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<OrderItem>>(v, jsonOptions) ?? new List<OrderItem>()
            );

            /* -------------------------------------------------
               ORDER ENTITY MAPPING
               ------------------------------------------------- */
            modelBuilder.Entity<Order>(entity =>
            {
                // PostgreSQL/Supabase tables are typically lowercase
                entity.ToTable("orders");

                entity.HasKey(o => o.Id);

                entity.Property(o => o.Id)
                    .HasColumnName("id");

                // Map the List to the JSONB column using the converter
                entity.Property(o => o.Items)
                    .HasColumnName("items")
                    .HasColumnType("jsonb")
                    .HasConversion(itemsConverter); 

                entity.Property(o => o.Subtotal).HasColumnName("subtotal");
                entity.Property(o => o.Tax).HasColumnName("tax");
                entity.Property(o => o.Total).HasColumnName("total");

                entity.Property(o => o.PaymentType).HasColumnName("payment_type");
                entity.Property(o => o.CardEntryMethod).HasColumnName("card_entry_method");

                entity.Property(o => o.CashTendered).HasColumnName("cash_tendered");
                entity.Property(o => o.ChangeGiven).HasColumnName("change_given");

                entity.Property(o => o.StripePaymentId).HasColumnName("stripe_payment_id");

                entity.Property(o => o.Timestamp).HasColumnName("timestamp");

                entity.Property(o => o.CustomerId).HasColumnName("customer_id");
                entity.Property(o => o.CustomerName).HasColumnName("customer_name");

                entity.Property(o => o.PickupTime).HasColumnName("pickup_time");
                entity.Property(o => o.Notes).HasColumnName("notes");
                entity.Property(o => o.CustomerEmail).HasColumnName("customer_email");
                entity.Property(o => o.CustomerPhone).HasColumnName("customer_phone");
                entity.Property(o => o.FulfillmentType).HasColumnName("fulfillment_type");
                entity.Property(o => o.Address).HasColumnName("address");
                entity.Property(o => o.City).HasColumnName("city");
                entity.Property(o => o.State).HasColumnName("state");
                entity.Property(o => o.Zip).HasColumnName("zip");
                entity.Property(o => o.Status).HasColumnName("status");
            });

            /* -------------------------------------------------
               PRODUCT ENTITY MAPPING
               ------------------------------------------------- */
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.Property(p => p.Id).HasColumnName("id");
                entity.Property(p => p.Name).HasColumnName("name");
                entity.Property(p => p.Price).HasColumnName("price");
                entity.Property(p => p.Description).HasColumnName("description");
                entity.Property(p => p.ImageUrl).HasColumnName("image_url");
                entity.Property(p => p.SortOrder).HasColumnName("sort_order");
            });
        }
    }
}