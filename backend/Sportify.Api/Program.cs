using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

using Sportify.Application;
using Sportify.Infrastructure;
using Sportify.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// --- ESCALABILIDAD Y RENDIMIENTO ---

// 1. Response Compression (Brotli y Gzip)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

// 2. Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<Sportify.Infrastructure.Persistence.SportifyDbContext>("Database");

// --- SEGURIDAD Y HARDENING ---

// 3. Global Exception Handler moderno
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 4. Rate Limiting (Proteccion contra fuerza bruta)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("AuthRateLimit", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});

// Configurar base de datos y servicios (DbContext Pooling ya configurado en AddInfrastructure)
builder.Services.AddInfrastructure(builder.Configuration);
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
builder.Services.AddApplication();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();

// 5. CORS estricto
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Seeders y Migraciones (Mantenemos como estaba)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<Sportify.Infrastructure.Persistence.SportifyDbContext>();
        
        try {
            var connStr = context.Database.GetDbConnection().ConnectionString;
            var builder2 = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connStr };
            builder2["Database"] = "";
            using var connection = new MySql.Data.MySqlClient.MySqlConnection(builder2.ConnectionString);
            connection.Open();
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "CREATE DATABASE IF NOT EXISTS sportify_db;";
            cmd.ExecuteNonQuery();
        } catch { }

        context.Database.Migrate();

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");

        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Sportify.Domain.Entities.Rol { Id = 1, Nombre = "ADMIN" },
                new Sportify.Domain.Entities.Rol { Id = 2, Nombre = "CONTADOR" },
                new Sportify.Domain.Entities.Rol { Id = 3, Nombre = "ENTRENADOR" },
                new Sportify.Domain.Entities.Rol { Id = 4, Nombre = "MIEMBRO" }
            );
            context.SaveChanges();
        }

        if (!context.Usuarios.Any())
        {
            context.Usuarios.AddRange(
                new Sportify.Domain.Entities.Usuario { Id = 1, Nombre = "Admin", Apellido = "Sportify", Correo = "admin@sportify.com", ContrasenaHash = passwordHash },
                new Sportify.Domain.Entities.Usuario { Id = 2, Nombre = "Carlos", Apellido = "Contador", Correo = "contador@sportify.com", ContrasenaHash = passwordHash },
                new Sportify.Domain.Entities.Usuario { Id = 3, Nombre = "Eduardo", Apellido = "Entrenador", Correo = "entrenador@sportify.com", ContrasenaHash = passwordHash },
                new Sportify.Domain.Entities.Usuario { Id = 4, Nombre = "Mario", Apellido = "Miembro", Correo = "miembro@sportify.com", ContrasenaHash = passwordHash }
            );
            context.SaveChanges();
            
            context.UsuarioRoles.AddRange(
                new Sportify.Domain.Entities.UsuarioRol { UsuarioId = 1, RolId = 1 },
                new Sportify.Domain.Entities.UsuarioRol { UsuarioId = 2, RolId = 2 },
                new Sportify.Domain.Entities.UsuarioRol { UsuarioId = 3, RolId = 3 },
                new Sportify.Domain.Entities.UsuarioRol { UsuarioId = 4, RolId = 4 }
            );
            context.SaveChanges();
        }

        if (!context.Sedes.Any())
        {
            context.Sedes.AddRange(
                new Sportify.Domain.Entities.Sede { Id = 1, Nombre = "Sede Principal Norte", Direccion = "Calle 100", Ciudad = "Bogota" },
                new Sportify.Domain.Entities.Sede { Id = 2, Nombre = "Sede Sur", Direccion = "Av Sur", Ciudad = "Medellin" }
            );
            context.SaveChanges();
        }

        if (!context.PlanesMembresia.Any())
        {
            context.PlanesMembresia.AddRange(
                new Sportify.Domain.Entities.PlanMembresia { Id = 1, Nombre = "Plan Basico", PrecioCOP = 50000m, DuracionDias = 30 },
                new Sportify.Domain.Entities.PlanMembresia { Id = 2, Nombre = "Plan Premium", PrecioCOP = 120000m, DuracionDias = 30 }
            );
            context.SaveChanges();
        }

        if (!context.Membresias.Any())
        {
            context.Membresias.Add(new Sportify.Domain.Entities.Membresia { Id = 1, UsuarioId = 4, PlanMembresiaId = 2, FechaInicio = DateTime.UtcNow.AddDays(-10), FechaFin = DateTime.UtcNow.AddDays(20), Estado = Sportify.Domain.Enums.EstadoMembresia.ACTIVA });
            context.SaveChanges();
        }

        if (!context.Pagos.Any())
        {
            context.Pagos.Add(new Sportify.Domain.Entities.Pago { Id = 1, UsuarioId = 4, MembresiaId = 1, MontoCOP = 120000m, FechaPago = DateTime.UtcNow.AddDays(-10), Estado = Sportify.Domain.Enums.EstadoPago.APROBADO, AprobadoPorId = 2 });
            context.SaveChanges();
        }

        if (!context.Competencias.Any())
        {
            context.Competencias.Add(new Sportify.Domain.Entities.Competencia { Id = 1, Nombre = "Torneo Relampago", Descripcion = "Torneo de fin de mes", FechaInicio = DateTime.UtcNow.AddDays(5), FechaFin = DateTime.UtcNow.AddDays(6), Ubicacion = "Sede Principal Norte", CreadoEn = DateTime.UtcNow });
            context.SaveChanges();
            context.InscripcionesCompetencia.Add(new Sportify.Domain.Entities.InscripcionCompetencia { Id = 1, UsuarioId = 4, CompetenciaId = 1, Estado = Sportify.Domain.Enums.EstadoInscripcion.CONFIRMADA, FechaInscripcion = DateTime.UtcNow });
            context.SaveChanges();
        }

        if (!context.Entrenamientos.Any())
        {
            context.Entrenamientos.Add(new Sportify.Domain.Entities.Entrenamiento { Id = 1, SedeId = 1, EntrenadorId = 3, Titulo = "Entrenamiento Funcional", Descripcion = "Cardio", FechaHora = DateTime.UtcNow.AddDays(1), CapacidadMaxima = 20, CreadoEn = DateTime.UtcNow });
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrio un error inyectando la base de datos.");
    }
}

// Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

// Registrar Global Exception Handler (.NET 8+)
app.UseExceptionHandler();

// Habilitar compression (Debe ir antes de archivos estaticos)
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseStaticFiles();

// Cambiamos al CORS mas seguro
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter(); // Habilitar middleware de Rate Limiting

// Mapear Health Checks endpoint
app.MapHealthChecks("/api/health");

app.MapControllers();

app.Run();

