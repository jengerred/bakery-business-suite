using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BakeryContext _db;

        public UsersController(BakeryContext db)
        {
            _db = db;
        }

        // 🔍 GET /api/users/find?value=5551234
        [HttpGet("find")]
        public async Task<IActionResult> FindUser([FromQuery] string value)
        {
            var user = await _db.Profiles
                .FirstOrDefaultAsync(u => u.Phone == value || u.Email == value);

            if (user == null) return NotFound();
            return Ok(user);
        }

        // ➕ POST /api/users
     [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] Profile dto) // Changed from UserDto to Profile
        {
            // Since we are using the Profile class, it already has the properties
            var newUser = new Profile
            {
                Id = Guid.NewGuid(),
                Name = dto.Name ?? "New Customer",
                Phone = dto.Phone,
                Email = dto.Email,
                LoyaltyPoints = 0
            };

            _db.Profiles.Add(newUser);
            await _db.SaveChangesAsync();

            return Ok(newUser);
        }
    }
}