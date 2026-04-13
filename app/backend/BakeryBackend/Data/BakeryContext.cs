using Microsoft.EntityFrameworkCore;
using BakeryBackend.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace BakeryBackend.Data
{
    public class BakeryContext : DbContext
    {
        public BakeryContext(DbContextOptions<BakeryContext> options)
            : base(options) {}

        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            // 1. Converter: List<OrderItem> <-> JSON String
            var itemsConverter = new ValueConverter<List<OrderItem>, string>(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<OrderItem>>(v, jsonOptions) ?? new List<OrderItem>()
            );

            // 2. Comparer: Needed so EF knows if the list inside the JSON changed
            var itemsComparer = new ValueComparer<List<OrderItem>>(
                (c1, c2) => JsonSerializer.Serialize(c1, jsonOptions) == JsonSerializer.Serialize(c2, jsonOptions),
                c => c == null ? 0 : JsonSerializer.Serialize(c, jsonOptions).GetHashCode(),
                c => JsonSerializer.Deserialize<List<OrderItem>>(JsonSerializer.Serialize(c, jsonOptions), jsonOptions) ?? new List<OrderItem>()
            );

            /* -------------------------------------------------
               ORDER ENTITY MAPPING (Matches Capitalized "Orders")
               ------------------------------------------------- */
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders"); // Matches Supabase casing

                /* All table column names must match Supabase casing. */
                entity.HasKey(o => o.Id);
                entity.Property(o => o.Id).HasColumnName("id");

                entity.Property(o => o.Items)
                    .HasColumnName("items")
                    .HasColumnType("jsonb")
                    .HasConversion(itemsConverter)
                    .Metadata.SetValueComparer(itemsComparer); 

                entity.Property(o => o.Subtotal).HasColumnName("subtotal");
                entity.Property(o => o.Tax).HasColumnName("tax");
                entity.Property(o => o.Total).HasColumnName("total");
                entity.Property(o => o.PaymentType).HasColumnName("payment_type");
                entity.Property(o => o.CardEntryMethod).HasColumnName("card_entry_method");
                entity.Property(o => o.CashTendered).HasColumnName("cash_tendered");
                entity.Property(o => o.ChangeGiven).HasColumnName("change_given");
                entity.Property(o => o.StripePaymentId).HasColumnName("stripe_payment_id");
                entity.Property(o => o.Timestamp).HasColumnName("created_at");
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
               PRODUCT ENTITY MAPPING (Matches Capitalized "Products")
               ------------------------------------------------- */
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products"); // Matches Supabase casing
                
                /* All table column names must match Supabase casing. */
                entity.Property(p => p.Id).HasColumnName("Id");
                entity.Property(p => p.Name).HasColumnName("Name");
                entity.Property(p => p.Price).HasColumnName("Price");
                entity.Property(p => p.Description).HasColumnName("Description");
                entity.Property(p => p.ImageUrl).HasColumnName("image_url");
                entity.Property(p => p.SortOrder).HasColumnName("sort_order");
            });
        }
    }
}