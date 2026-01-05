using ControleGastos.Api.Data;
using ControleGastos.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =========================
// Banco de dados
// Dev: SQLite | Prod: PostgreSQL (Render)
// =========================
if (builder.Environment.IsDevelopment())
{
    // Localhost (SQLite)
    var dbPath = Path.Combine(builder.Environment.ContentRootPath, "controle_gastos.db");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
}
else
{
    // Render/Production (Postgres)
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrWhiteSpace(conn))
        throw new Exception("ConnectionStrings__DefaultConnection não configurada.");

    conn = ConvertPostgresUrlToNpgsql(conn);

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(conn));
}

// Helper (pode ficar no final do Program.cs)
static string ConvertPostgresUrlToNpgsql(string conn)
{
    if (conn.Contains("Host=", StringComparison.OrdinalIgnoreCase))
        return conn;

    if (!(conn.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
          conn.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
        return conn;

    var uri = new Uri(conn);
    var userInfo = uri.UserInfo.Split(':', 2);

    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var host = uri.Host;
    var port = uri.Port;
    if (port <= 0) port = 5432;
    var database = uri.AbsolutePath.Trim('/');

    var query = uri.Query.TrimStart('?');
    var extra = string.IsNullOrWhiteSpace(query) ? "" : ";" + query.Replace("&", ";");

    return $"Host={host};Port={port};Database={database};Username={username};Password={password}{extra}";
}


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

// Endpoint simples para "acordar" o serviço (Render Free) e checar saúde
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapControllers();

app.Run();
