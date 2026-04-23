using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;
using BakeryBackend.Dtos;

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This will be /api/orders
    public class OrdersController : ControllerBase
    {
        private readonly BakeryContext _db;

        public OrdersController(BakeryContext db)
        {
            _db = db;
        }

        /* ---------------------------------------------------------
           🚀 CREATE ORDER & UPDATE INVENTORY
           POST: api/orders
           - Creates a new order record
           - Decrements stock levels in the Products table
        --------------------------------------------------------- */
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDto order)
        {
            // ✅ Check 'order' instead of 'dto'
            if (order == null)
                return BadRequest("Order payload is missing.");

            // Renamed to 'newOrder' to avoid conflict with 'order' parameter
            var newOrder = new Order
            {
                Id = Guid.NewGuid(),
                // 📍 Mapping from 'order' fields
                Items = order.Items.Select(i => new OrderItem
                {
                    Product = i.Product,
                    Quantity = i.Quantity
                }).ToList(),

                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,

                PaymentType = order.PaymentType,
                CardEntryMethod = order.CardEntryMethod,
                CashTendered = order.CashTendered,
                ChangeGiven = order.ChangeGiven,
                StripePaymentId = order.StripePaymentId,

                CreatedAt = DateTime.UtcNow,

                CustomerId = order.CustomerId,
                CustomerName = order.CustomerName,
                CustomerEmail = order.CustomerEmail,
                CustomerPhone = order.CustomerPhone,

                PickupTime = order.PickupTime,
                Notes = order.Notes,
                FulfillmentType = order.FulfillmentType ?? "pickup", // Default to pickup if not provided
                Address = order.Address,
                City = order.City,
                State = order.State,
                Zip = order.Zip,
                Status = order.Status,
            };

            /* ---------------------------------------------------------
               🍞 INVENTORY LOGIC
               - Loops through items and reduces StockQuantity in DB
            --------------------------------------------------------- */
            foreach (var item in newOrder.Items)
            {

                /* Compare p.Name (string) to item.Product.Name (string)  
                    to 🔍 find the matching product in the database */
                var product = await _db.Products
                    .FirstOrDefaultAsync(p => p.Name == item.Product.Name);

                if (product != null && product.TrackInventory)
                {
                    product.StockQuantity -= item.Quantity;

                    //  Safety check: Don't allow negative stock in the DB
                    if (product.StockQuantity < 0) 
                    {
                        product.StockQuantity = 0;
                    }
                }
            }

            try 
            {
                // 💾 Save Order and Inventory changes in one transaction
                _db.Orders.Add(newOrder);
                await _db.SaveChangesAsync();

                return Ok(newOrder);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { Error = "Database crash during order creation", Details = errorMessage });
            }
        }

        /* ---------------------------------------------------------
           🔍 GET ALL ORDERS
           GET: api/orders
           - Returns all orders sorted by newest first
           - Used by the Manager Dashboard for fulfillment
        --------------------------------------------------------- */
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _db.Orders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        /* ---------------------------------------------------------
           🛠️ UPDATE ORDER STATUS (The Ops Center Action)
           PATCH: api/orders/{id}/status
        --------------------------------------------------------- */
     [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound("Order not found.");

            // Update status
            order.Status = dto.NewStatus;

            // Save pickup time if provided
            if (dto.Pickup_Time.HasValue)
                order.PickupTime = dto.Pickup_Time.Value;

            // Save cash tendered if provided
            if (dto.Cash_Tendered.HasValue)
                order.CashTendered = dto.Cash_Tendered.Value;

            // Save change given if provided
            if (dto.Change_Given.HasValue)
                order.ChangeGiven = dto.Change_Given.Value;

            if (!string.IsNullOrEmpty(dto.Payment_Type))
                order.PaymentType = dto.Payment_Type;

            if (!string.IsNullOrEmpty(dto.Card_Entry_Method))
                order.CardEntryMethod = dto.Card_Entry_Method;

            if (!string.IsNullOrEmpty(dto.Stripe_Payment_Id))
                order.StripePaymentId = dto.Stripe_Payment_Id;    

            // Auto-set FulfilledAt for completed statuses
            if (dto.NewStatus == "Shipped" || dto.NewStatus == "PickedUp" || dto.NewStatus == "Completed")
            {
                order.FulfilledAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return Ok(order);
        }

    }

    // Small DTO for the status update
   public class UpdateStatusDto
    {
        public string NewStatus { get; set; } = string.Empty;
        public DateTime? Pickup_Time { get; set; }
        public decimal? Cash_Tendered { get; set; }
        public decimal? Change_Given { get; set; }
        public string? Payment_Type { get; set; }
        public string? Card_Entry_Method { get; set; }
        public string? Stripe_Payment_Id { get; set; }
        }

}