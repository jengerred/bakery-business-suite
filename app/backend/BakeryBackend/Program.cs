using BakeryBackend.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


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

builder.Services.AddSingleton<BakeryBackend.Services.JwtService>();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
            )
        };
    });


/* ---------------------------------------------------------
  Build NpgsqlDataSource ONCE (correct for Npgsql 8.x)
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
