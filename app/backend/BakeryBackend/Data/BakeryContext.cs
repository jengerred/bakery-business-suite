using Microsoft.EntityFrameworkCore;
using BakeryBackend.Models;

namespace BakeryBackend.Data
{
    /* ---------------------------------------------------------
       BAKERY CONTEXT (Entity Framework Core)
       ---------------------------------------------------------
       This class represents the database session for the
       bakery backend. It defines:

         - Which tables exist (DbSet<T>)
         - How EF Core maps models to the database
         - Any custom configuration (via OnModelCreating)

       The BakeryContext is injected into controllers and
       services so they can perform CRUD operations on the DB.

       NOTE:
       - Add new DbSet<T> properties here as your system grows
         (Orders, Employees, Customers, Inventory, etc.)
       --------------------------------------------------------- */

    public class BakeryContext : DbContext
    {
        public BakeryContext(DbContextOptions<BakeryContext> options)
            : base(options) {}

        /* -----------------------------------------------------
           DATABASE TABLES
           ----------------------------------------------------- */

        // Existing table
        public DbSet<Product> Products { get; set; }

        // NEW: Orders table
        public DbSet<Order> Orders { get; set; }

        /* -----------------------------------------------------
           MODEL CONFIGURATION
           -----------------------------------------------------
           This is where we map C# models to PostgreSQL tables.
           We also configure JSONB, column names, relationships,
           and any custom EF Core behavior.
           ----------------------------------------------------- */
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /* -------------------------------------------------
               ORDER ENTITY MAPPING
               -------------------------------------------------
               Maps the Order model to the "orders" table in
               Supabase/PostgreSQL.

               Includes:
               - JSONB mapping for Items
               - Column name mappings
               - Nullable vs non-nullable fields
            ------------------------------------------------- */
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");

                entity.Property(o => o.Id)
                    .HasColumnName("id");

                entity.Property(o => o.Items)
                    .HasColumnName("items")
                    .HasColumnType("jsonb"); // JSONB column in Supabase

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
            });
        }
    }
}
