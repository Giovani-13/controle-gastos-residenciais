using ControleGastos.Api.Data;
using ControleGastos.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =========================
// Banco de dados (SQLite)
// =========================
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "controle_gastos.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// =========================
// Controllers + JSON options
// =========================
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opt.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        );
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// =========================
// CORS
// =========================
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontDev", policy =>
    {
        policy
            .WithOrigins(
                "https://controle-gastos-web.onrender.com", // Front no Render
                "http://localhost:5173",                   // Vite local
                "http://localhost:3000"                    // opcional
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =========================
// Swagger
// =========================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =========================
// Services (DI)
// =========================
builder.Services.AddScoped<PessoaService>();
builder.Services.AddScoped<CategoriaService>();
builder.Services.AddScoped<TransacaoService>();

var app = builder.Build();

// Garante migrations (local e Render também pode rodar, sem problema)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// =========================
// Pipeline HTTP
// =========================
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// CORS precisa vir antes de Authorization/MapControllers
app.UseCors("FrontDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
