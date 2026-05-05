using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BakeryBackend.Data;          // DbContext
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
        // EMPLOYEE LOGIN (EmployeeID + PIN)
        // ---------------------------------------------------------
        [HttpPost("pin-login")]
        public async Task<IActionResult> PinLogin([FromBody] PinLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.EmployeeId) || string.IsNullOrWhiteSpace(request.Pin))
                return BadRequest(new { error = "Employee ID and PIN required" });

            // Find employee by last 4 of UUID
            var user = await _context.Profiles
                .Where(u => u.PinHash != null && u.Role != "customer")
                .FirstOrDefaultAsync(u => u.Id.ToString().EndsWith(request.EmployeeId));

            if (user == null)
                return Unauthorized(new { error = "Employee not found" });

            // Verify PIN
            if (!PinHasher.VerifyPin(request.Pin, user.PinHash))
                return Unauthorized(new { error = "Invalid PIN" });

            // Create JWT
            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                role = user.Role,
                employeeId = request.EmployeeId,
                token = token
            });
        }

        // ---------------------------------------------------------
        // GET CURRENT USER (requires JWT)
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
                role = user.Role,
                employeeId = user.Id.ToString().Substring(user.Id.ToString().Length - 4)
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
        public string? EmployeeId { get; set; }   // last 4 of UUID
        public string? Pin { get; set; }
    }

    public class SetPinRequest
    {
        public Guid UserId { get; set; }
        public string? Pin { get; set; }
    }
}
