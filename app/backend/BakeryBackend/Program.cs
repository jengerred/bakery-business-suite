using BakeryBackend.Data;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// SERVICES
// ---------------------------------------------------------

builder.Services.AddOpenApi();
builder.Services.AddControllers()  // Required for attribute-based controllers
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });


builder.Services.AddDbContext<BakeryContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);


// ⭐ CORS POLICY ⭐
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// ---------------------------------------------------------
// MIDDLEWARE PIPELINE
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// ⭐ Apply CORS before controllers ⭐
app.UseCors("AllowAll");

app.MapControllers(); // Required for API endpoints

app.Run();
