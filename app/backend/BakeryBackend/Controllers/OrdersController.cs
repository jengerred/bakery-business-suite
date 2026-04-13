using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;
using BakeryBackend.Dtos;

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly BakeryContext _db;

        public OrdersController(BakeryContext db)
        {
            _db = db;
        }

        // ----------------------------------------------------
        // POST /api/orders
        // ----------------------------------------------------
        
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

                // Make sure your DTO provides a DateTime for Timestamp
                Timestamp = order.Timestamp != default ? order.Timestamp : DateTime.UtcNow,

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

            _db.Orders.Add(newOrder);
            await _db.SaveChangesAsync();

            return Ok(newOrder);
        }

        // ----------------------------------------------------
        // GET /api/orders
        // ----------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _db.Orders
                .OrderByDescending(o => o.Timestamp)
                .ToListAsync();

            return Ok(orders);
        }
    }
}