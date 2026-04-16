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

            // ✅ Renamed to 'newOrder' to avoid conflict with 'order' parameter
            var newOrder = new Order
            {
                Id = Guid.NewGuid(),
                // ✅ Mapping from 'order' fields
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
                FulfillmentType = order.FulfillmentType,
                Address = order.Address,
                City = order.City,
                State = order.State,
                Zip = order.Zip,
                Status = order.Status ?? "paid"
            };

            /* ---------------------------------------------------------
               🍞 INVENTORY LOGIC
               - Loops through items and reduces StockQuantity in DB
            --------------------------------------------------------- */
            foreach (var item in newOrder.Items)
            {
                // Compare p.Name (string) to item.Product.Name (string) 
                // or item.Product if 'item.Product' is the string name from the DTO.
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
    }
}