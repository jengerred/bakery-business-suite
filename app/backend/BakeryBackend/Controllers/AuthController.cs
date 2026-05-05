using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BakeryBackend.Data;          // your DbContext namespace
using BakeryBackend.Models;        // Profile model
using BakeryBackend.Utils;         // PinHasher
using BakeryBackend.Services;      // JwtService

namespace BakeryBackend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly BakeryContext _context;
        private readonly JwtService _jwtService;

        public AuthController(BakeryContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // ---------------------------------------------------------
        // PIN LOGIN
        // ---------------------------------------------------------
        [HttpPost("pin-login")]
        public async Task<IActionResult> PinLogin([FromBody] PinLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Pin))
                return BadRequest(new { error = "PIN required" });

            // Get all profiles with a PIN set
           var candidates = await _context.Profiles
                .Where(u => u.PinHash != null && u.Role != "customer")
                .ToListAsync();

            // Verify PIN against each hash
          var user = candidates.FirstOrDefault(u => PinHasher.VerifyPin(request.Pin, u.PinHash));


            if (user == null)
                return Unauthorized(new { error = "Invalid PIN" });

            // Only employees, managers, admins can use POS
            if (user.Role == "customer")
                return Unauthorized(new { error = "Customers cannot use POS" });

            // Create JWT
            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                role = user.Role,
                token = token
            });
        }

        // ---------------------------------------------------------
        // GET CURRENT USER
        // ---------------------------------------------------------
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirst("id")?.Value;

            if (userId == null)
                return Unauthorized();

            var user = await _context.Profiles.FindAsync(Guid.Parse(userId));

            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                role = user.Role
            });
        }

        // ---------------------------------------------------------
        // SET PIN (Manager/Admin Only)
        // ---------------------------------------------------------
        [Authorize(Roles = "manager,admin")]
        [HttpPost("set-pin")]
        public async Task<IActionResult> SetPin([FromBody] SetPinRequest request)
        {
            var user = await _context.Profiles.FindAsync(request.UserId);

            if (user == null)
                return NotFound(new { error = "User not found" });

            user.PinHash = PinHasher.HashPin(request.Pin);

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }

    // ---------------------------------------------------------
    // REQUEST MODELS
    // ---------------------------------------------------------
    public class PinLoginRequest
    {
        public string? Pin { get; set; }
    }

    public class SetPinRequest
    {
        public Guid UserId { get; set; }
        public string? Pin { get; set; }
    }
}