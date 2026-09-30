using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;

using Sportify.Application;
using Sportify.Infrastructure;
using System.Text;
using Sportify.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configurar base de datos y servicios
builder.Services.AddInfrastructure(builder.Configuration);
// Add QuestPDF Community License
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

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Inicializacion Automatica de Base de Datos y Seeders Explicitos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<Sportify.Infrastructure.Persistence.SportifyDbContext>();
        
        // BORRAR LA BASE DE DATOS COMPLETAMENTE PARA EVITAR CONFLICTOS
        context.Database.EnsureDeleted();
        // RECREARLA DESDE CERO CON EL ESQUEMA PERFECTO
        context.Database.EnsureCreated();

        // INYECCION DE DATOS MANUAL A PRUEBA DE FALLOS
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

        // FUERZA BRUTA: Actualizar todas las contraseñas existentes a Admin123! en caso de que la BD antigua haya sobrevivido
        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE Usuarios ADD COLUMN SolicitaCambioClave TINYINT(1) DEFAULT 0;");
        } catch { /* Ignore if it already exists */ }

        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE Entrenamientos ADD COLUMN Estado VARCHAR(50) DEFAULT 'PENDIENTE';");
        } catch { /* Ignore if it already exists */ }

        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE Entrenamientos ADD COLUMN FechaFin DATETIME;");
            context.Database.ExecuteSqlRaw("UPDATE Entrenamientos SET FechaFin = DATE_ADD(FechaHora, INTERVAL 2 HOUR) WHERE FechaFin IS NULL;");
        } catch { /* Ignore if it already exists */ }

        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE EvaluacionesCompetencia ADD COLUMN Desempeno VARCHAR(50);");
        } catch { /* Ignore if it already exists */ }

        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE Sedes ADD COLUMN Telefono VARCHAR(50);");
        } catch { /* Ignore if it already exists */ }

        try {
            context.Database.ExecuteSqlRaw("ALTER TABLE Usuarios ADD COLUMN SedeId INT;");
            context.Database.ExecuteSqlRaw("ALTER TABLE Usuarios ADD CONSTRAINT FK_Usuarios_Sedes_SedeId FOREIGN KEY (SedeId) REFERENCES Sedes(Id);");
        } catch { /* Ignore if it already exists */ }
        
        context.Database.ExecuteSqlRaw("UPDATE Usuarios SET ContrasenaHash = {0}", passwordHash);

        if (!context.Sedes.Any())
        {
            context.Sedes.AddRange(
                new Sportify.Domain.Entities.Sede { Id = 1, Nombre = "Sede Principal Norte", Direccion = "Calle 100", Ciudad = "Bogotá" },
                new Sportify.Domain.Entities.Sede { Id = 2, Nombre = "Sede Sur", Direccion = "Av Sur", Ciudad = "Medellín" }
            );
            context.SaveChanges();
        }

        if (!context.PlanesMembresia.Any())
        {
            context.PlanesMembresia.AddRange(
                new Sportify.Domain.Entities.PlanMembresia { Id = 1, Nombre = "Plan Básico", PrecioCOP = 50000m, DuracionDias = 30 },
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
            context.Competencias.Add(new Sportify.Domain.Entities.Competencia { Id = 1, Nombre = "Torneo Relámpago", Descripcion = "Torneo de fin de mes", FechaInicio = DateTime.UtcNow.AddDays(5), FechaFin = DateTime.UtcNow.AddDays(6), Ubicacion = "Sede Principal Norte", CreadoEn = DateTime.UtcNow });
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

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();

// Importante para leer comprobantes y archivos de wwwroot
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
