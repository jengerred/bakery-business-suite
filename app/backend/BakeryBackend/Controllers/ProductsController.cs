using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;

namespace BakeryBackend.Controllers
{
    /* ---------------------------------------------------------
       PRODUCTS CONTROLLER (CRUD API)
       ---------------------------------------------------------
       This controller exposes full CRUD operations for products:

         C - CREATE   (POST /api/products)
         R - READ     (GET /api/products, GET /api/products/{id})
         U - UPDATE   (PUT /api/products/{id})
         D - DELETE   (DELETE /api/products/{id})

       It is used by:
         - Shop frontend (menu display)
         - POS frontend (order entry)
         - Admin tools (future feature)
       --------------------------------------------------------- */

    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly BakeryContext _context;

        public ProductsController(BakeryContext context)
        {
            _context = context;
        }

        /* ---------------------------------------------------------
           READ ALL PRODUCTS
           GET: api/products
           - Returns all products sorted by SortOrder
           - Used by both Shop + POS
           --------------------------------------------------------- */
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .OrderBy(p => p.SortOrder)
                .ToListAsync();
        }

        /* ---------------------------------------------------------
           READ SINGLE PRODUCT
           GET: api/products/{id}
           --------------------------------------------------------- */
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            return product;
        }

        /* ---------------------------------------------------------
           CREATE PRODUCT
           POST: api/products
           - Accepts a ProductDto
           - Creates a new Product entity
           --------------------------------------------------------- */
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        /* ---------------------------------------------------------
           UPDATE PRODUCT
           PUT: api/products/{id}
           - Updates name, price, description
           --------------------------------------------------------- */
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, ProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Description = dto.Description;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /* ---------------------------------------------------------
           DELETE PRODUCT
           DELETE: api/products/{id}
           --------------------------------------------------------- */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
