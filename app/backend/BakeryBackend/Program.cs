using BakeryBackend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

/* ---------------------------------------------------------
   SERVICE CONFIGURATION
   --------------------------------------------------------- */

// ✅ FIXED: Replaced .NET 9 AddOpenApi() with .NET 8 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register controllers + JSON camelCase formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ensures JSON fields use camelCase (imageUrl, sortOrder, etc.)
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Register EF Core + PostgreSQL connection with dynamic JSON enabled
builder.Services.AddDbContext<BakeryContext>(options =>
{
    var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );

    // ⭐ REQUIRED for JSONB serialization of List<OrderItem>
    dataSourceBuilder.EnableDynamicJson();

    var dataSource = dataSourceBuilder.Build();

    options.UseNpgsql(dataSource);
});

// ---------------------------------------------------------
// CORS POLICY (Allows frontend apps to call this API)
// ---------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()   // Allow any domain
            .AllowAnyMethod()   // GET, POST, PUT, DELETE
            .AllowAnyHeader();  // Custom headers
    });
});

var app = builder.Build();

/* ---------------------------------------------------------
   MIDDLEWARE PIPELINE
   --------------------------------------------------------- */

// ✅ FIXED: Replaced .NET 9 MapOpenApi() with .NET 8 Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirect HTTP → HTTPS (Note: If Railway 500s, try commenting this out)
app.UseHttpsRedirection();

// Apply CORS before routing
app.UseCors("AllowAll");

// Map controller endpoints (e.g., /api/products)
app.MapControllers();

// Start the application
app.Run();