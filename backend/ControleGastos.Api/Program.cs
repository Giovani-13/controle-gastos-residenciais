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
        // Retorna JSON em camelCase (ex.: pessoaId, totalGeral, etc.)
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

        // Aceita tanto "PessoaId" quanto "pessoaId" no JSON recebido
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;

        // Permite enviar/receber enums como string:
        // Ex.: "despesa", "receita", "ambas"
        opt.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        );

        // Evita erro de "A possible object cycle was detected"
        // quando existe navegação circular (Pessoa -> Transacoes -> Pessoa)
        opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// =========================
// CORS (React Vite)
// =========================
// Permite que o front em http://localhost:5173 acesse a API sem bloqueio do browser.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontDev", policy =>
    {
        policy.WithOrigins(
            "https://controle-gastos-web.onrender.com",
            "http://localhost:5173")
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
// OBS: você tinha PessoaService duplicado e faltava CategoriaService.
builder.Services.AddScoped<PessoaService>();
builder.Services.AddScoped<CategoriaService>();
builder.Services.AddScoped<TransacaoService>();


// -------------------- CORS --------------------
// Permite que o front (Vite) em http://localhost:5173 acesse a API.
// (Sem isso, o navegador bloqueia e aparece "Failed to fetch")
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Em desenvolvimento, garante que o banco esteja atualizado com as migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// =========================
// Pipeline HTTP
// =========================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS precisa vir antes de Authorization/MapControllers
app.UseCors("FrontDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
