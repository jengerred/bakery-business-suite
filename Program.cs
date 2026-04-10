using BakeryBackend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// PORT BINDING (Railway needs this)
// ---------------------------------------------------------
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
Console.WriteLine($"🌐 PORT ENV: {port}");

// ---------------------------------------------------------
// SERVICES
// ---------------------------------------------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddDbContext<BakeryContext>(options =>
{
    Console.WriteLine("🗄️ Initializing DbContext with connection string:");
    Console.WriteLine(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

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

Console.WriteLine("🚀 Application built successfully. Starting middleware pipeline...");

// ---------------------------------------------------------
// GLOBAL EXCEPTION LOGGING
// ---------------------------------------------------------

app.Use(async (context, next) =>
{
    Console.WriteLine($"➡️ Incoming request: {context.Request.Method} {context.Request.Path}");

    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine("🔥 UNHANDLED EXCEPTION:");
        Console.WriteLine(ex.ToString());
        throw;
    }
});

// ---------------------------------------------------------
// MIDDLEWARE PIPELINE
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    Console.WriteLine("🧪 Development mode: enabling Swagger");
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
Console.WriteLine("🔒 HTTPS redirection enabled");

app.UseCors("AllowAll");
Console.WriteLine("🌍 CORS policy applied");

app.MapControllers();
Console.WriteLine("🧭 Controllers mapped");

Console.WriteLine("🚀 About to run the application...");
app.Run();

Console.WriteLine("❌ app.Run() exited unexpectedly.");
