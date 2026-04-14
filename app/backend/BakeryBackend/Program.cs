using BakeryBackend.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

/* ---------------------------------------------------------
   SERVICE CONFIGURATION
   --------------------------------------------------------- */

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

/* ---------------------------------------------------------
   FIXED: Build NpgsqlDataSource ONCE (correct for Npgsql 8.x)
   --------------------------------------------------------- */

var dataSourceBuilder = new NpgsqlDataSourceBuilder(
    builder.Configuration.GetConnectionString("DefaultConnection")
);

// Enable dynamic JSON (your version supports this here)
dataSourceBuilder.EnableDynamicJson();

var dataSource = dataSourceBuilder.Build();

// Register as singleton
builder.Services.AddSingleton(dataSource);

/* ---------------------------------------------------------
   Register DbContext using the SINGLE shared data source
   --------------------------------------------------------- */

builder.Services.AddDbContext<BakeryContext>(options =>
{
    options.UseNpgsql(dataSource);
});

/* ---------------------------------------------------------
   CORS
   --------------------------------------------------------- */
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

/* ---------------------------------------------------------
   MIDDLEWARE
   --------------------------------------------------------- */

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();
app.Run();
