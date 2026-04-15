using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BakeryBackend.Data;
using BakeryBackend.Models;
using BakeryBackend.Dtos;


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


        /* ---------------------------------------------------------
           ✅ Get All Profiles
           GET: api/profiles
           - Returns all profiles in the database
           - Used by both Shop + POS for profile management
        --------------------------------------------------------- */
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profiles = await _db.Profiles.ToListAsync();
            return Ok(profiles);
        }

        /* ---------------------------------------------------------
           🔍 FIND PROFILE
           GET: api/profiles/find?value=...
           - Finds a profile by matching phone OR email
           - Used by both Shop + POS for quick profile lookup
        --------------------------------------------------------- */
        [HttpGet("find")]
        public async Task<IActionResult> FindProfile([FromQuery] string value)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(u => u.Phone == value || u.Email == value);

            if (profile == null) return NotFound();
            return Ok(profile);
        }


        /* ---------------------------------------------------------
           🔄 UPDATE PROFILE
           PUT: api/profiles/{id}
           - Updates profiles based on the provided UserDto
           - Used by both Shop + POS for profile management
        --------------------------------------------------------- */
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UserDto updatedUser)
        {
            // Changed _context to _db here
            var profile = await _db.Profiles.FindAsync(id); 
            if (profile == null) return NotFound();

            // Map the new fields from the DTO to the Database Model
            profile.Name = updatedUser.Name;
            profile.Phone = updatedUser.Phone;
            profile.Address = updatedUser.Address;
            profile.City = updatedUser.City;
            profile.Zip = updatedUser.Zip;

            try
            {
                // Changed _context to _db here too
                await _db.SaveChangesAsync(); 
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        /* ---------------------------------------------------------
           ➕  CREATE PROFILE
           POST: api/profiles
           - Creates a new profile with the provided UserDto
        --------------------------------------------------------- */
       [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] UserDto dto)
        {
            try 
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
            catch (Exception ex)
            {
                // This will send the exact database crash message back to your frontend/logs
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { Error = "Database crash", Details = errorMessage });
            }
        }

        /* ---------------------------------------------------------
            ❌ DELETE PROFILE
            DELETE: api/profiles/{id}
            - Removes a profile from the database
        --------------------------------------------------------- */
            [HttpDelete("{id}")]
            public async Task<IActionResult> DeleteProfile(Guid id)
            {
                var profile = await _db.Profiles.FindAsync(id);
                if (profile == null) return NotFound(new { Message = "Profile not found." });

                _db.Profiles.Remove(profile);
                await _db.SaveChangesAsync();
                return Ok(new { Message = "Profile deleted successfully." });
            }
    }
}