using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;
using BakeryBackend.Dtos;

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("orders")]
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
        public async Task<IActionResult> CreateOrder([FromBody] OrderDto dto)
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
                CustomerName = dto.CustomerName
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
