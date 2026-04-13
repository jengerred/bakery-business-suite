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
        // POST /orders
        // Creates a new order in the database
        // ----------------------------------------------------
        
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDto order) // This will now accept the flat fields
        {
            if (dto == null)
                return BadRequest("Order payload is missing.");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                Items = dto.Items.Select(i => new OrderItem
                {
                    Product = i.Product,
                    Quantity = i.Quantity
                }).ToList(),

                Subtotal = dto.Subtotal,
                Tax = dto.Tax,
                Total = dto.Total,

                PaymentType = dto.PaymentType,
                CardEntryMethod = dto.CardEntryMethod,

                CashTendered = dto.CashTendered,
                ChangeGiven = dto.ChangeGiven,

                StripePaymentId = dto.StripePaymentId,

                Timestamp = dto.Timestamp,

                CustomerId = dto.CustomerId,
                CustomerName = dto.CustomerName,

                PickupTime = dto.PickupTime,
        
                Notes = dto.Notes,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                FulfillmentType = dto.FulfillmentType,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Zip = dto.Zip,
                Status = dto.Status ?? "paid"
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return Ok(order);
        }
        // ----------------------------------------------------
        // GET /orders
        // Returns all orders sorted by newest first
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
