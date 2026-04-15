using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This will now be /api/profiles
    public class ProfilesController : ControllerBase
    {
        private readonly BakeryContext _db;

        public ProfilesController(BakeryContext db)
        {
            _db = db;
        }

        // ✅ GET /api/profiles 
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profiles = await _db.Profiles.ToListAsync();
            return Ok(profiles);
        }

        // 🔍 GET /api/profiles/find?value=...
        [HttpGet("find")]
        public async Task<IActionResult> FindProfile([FromQuery] string value)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(u => u.Phone == value || u.Email == value);

            if (profile == null) return NotFound();
            return Ok(profile);
        }

        // ➕ POST /api/profiles
        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] UserDto dto)
        {
            var newProfile = new Profile
            {
                Id = Guid.NewGuid(),
                Name = dto.Name ?? "New Customer",
                Phone = dto.Phone,
                Email = dto.Email,
                LoyaltyPoints = 0
            };

            _db.Profiles.Add(newProfile);
            await _db.SaveChangesAsync();

            return Ok(newProfile);
        }
    }
}