using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Infrastructure.Persistence;

public class SportifyDbContext : DbContext
{
    public SportifyDbContext(DbContextOptions<SportifyDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<UsuarioRol> UsuarioRoles => Set<UsuarioRol>();
    public DbSet<Membresia> Membresias => Set<Membresia>();
    public DbSet<PlanMembresia> PlanesMembresia => Set<PlanMembresia>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<ComprobantePago> ComprobantesPago => Set<ComprobantePago>();
    public DbSet<Sede> Sedes => Set<Sede>();
    public DbSet<Entrenamiento> Entrenamientos => Set<Entrenamiento>();
    public DbSet<Asistencia> Asistencias => Set<Asistencia>();
    public DbSet<Competencia> Competencias => Set<Competencia>();
    public DbSet<InscripcionCompetencia> InscripcionesCompetencia => Set<InscripcionCompetencia>();
    public DbSet<EvaluacionCompetencia> EvaluacionesCompetencia => Set<EvaluacionCompetencia>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Usuario ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Correo).IsRequired().HasMaxLength(256);
            entity.HasIndex(u => u.Correo).IsUnique();
            entity.Property(u => u.ContrasenaHash).IsRequired();
            entity.Property(u => u.Activo).HasDefaultValue(true);
            entity.Property(u => u.CreadoEn).HasDefaultValueSql("(UTC_TIMESTAMP())");
        });

        // ─── Rol ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Nombre).IsRequired().HasMaxLength(50);
            entity.HasIndex(r => r.Nombre).IsUnique();
        });

        // ─── UsuarioRol ───────────────────────────────────────────────────────
        modelBuilder.Entity<UsuarioRol>(entity =>
        {
            entity.HasKey(ur => ur.Id);
            entity.HasIndex(ur => new { ur.UsuarioId, ur.RolId }).IsUnique();

            entity.HasOne(ur => ur.Usuario)
                  .WithMany(u => u.UsuarioRoles)
                  .HasForeignKey(ur => ur.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Rol)
                  .WithMany(r => r.UsuarioRoles)
                  .HasForeignKey(ur => ur.RolId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PlanMembresia ────────────────────────────────────────────────────
        modelBuilder.Entity<PlanMembresia>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(p => p.PrecioCOP).HasColumnType("decimal(18,2)");
        });

        // ─── Membresia ────────────────────────────────────────────────────────
        modelBuilder.Entity<Membresia>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.Property(m => m.Estado)
                  .HasConversion<string>()
                  .HasMaxLength(50);

            entity.HasOne(m => m.Usuario)
                  .WithMany(u => u.Membresias)
                  .HasForeignKey(m => m.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.PlanMembresia)
                  .WithMany(p => p.Membresias)
                  .HasForeignKey(m => m.PlanMembresiaId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── Pago ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Pago>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.MontoCOP).HasColumnType("decimal(18,2)");

            entity.Property(p => p.Estado)
                  .HasConversion<string>()
                  .HasMaxLength(50);

            // Borrado logico: solo devuelve pagos no eliminados
            entity.HasQueryFilter(p => p.EliminadoEn == null);

            entity.HasOne(p => p.Usuario)
                  .WithMany(u => u.Pagos)
                  .HasForeignKey(p => p.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Membresia)
                  .WithMany(m => m.Pagos)
                  .HasForeignKey(p => p.MembresiaId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Evitar ciclos de referencias multiples
            entity.HasOne(p => p.AprobadoPor)
                  .WithMany()
                  .HasForeignKey(p => p.AprobadoPorId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // ─── ComprobantePago ─────────────────────────────────────────────────
        modelBuilder.Entity<ComprobantePago>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.NombreArchivo).IsRequired().HasMaxLength(500);

            // Relacion 1-1 con Pago
            entity.HasOne(c => c.Pago)
                  .WithOne(p => p.Comprobante)
                  .HasForeignKey<ComprobantePago>(c => c.PagoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Sede ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Sede>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Nombre).IsRequired().HasMaxLength(150);
        });

        // ─── Entrenamiento ────────────────────────────────────────────────────
        modelBuilder.Entity<Entrenamiento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(150);

            // Borrado logico
            entity.HasQueryFilter(e => e.EliminadoEn == null);

            entity.HasOne(e => e.Sede)
                  .WithMany(s => s.Entrenamientos)
                  .HasForeignKey(e => e.SedeId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Evitar ciclos: Entrenador -> Usuario
            entity.HasOne(e => e.Entrenador)
                  .WithMany()
                  .HasForeignKey(e => e.EntrenadorId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // ─── Asistencia ───────────────────────────────────────────────────────
        modelBuilder.Entity<Asistencia>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.HasIndex(a => new { a.UsuarioId, a.EntrenamientoId }).IsUnique();

            entity.HasOne(a => a.Usuario)
                  .WithMany(u => u.Asistencias)
                  .HasForeignKey(a => a.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Entrenamiento)
                  .WithMany(e => e.Asistencias)
                  .HasForeignKey(a => a.EntrenamientoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Competencia ──────────────────────────────────────────────────────
        modelBuilder.Entity<Competencia>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Nombre).IsRequired().HasMaxLength(200);
            
            // Borrado logico
            entity.HasQueryFilter(c => c.EliminadoEn == null);
        });

        // ─── InscripcionCompetencia ───────────────────────────────────────────
        modelBuilder.Entity<InscripcionCompetencia>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.HasIndex(i => new { i.UsuarioId, i.CompetenciaId }).IsUnique();

            entity.Property(i => i.Estado)
                  .HasConversion<string>()
                  .HasMaxLength(50);

            entity.HasOne(i => i.Usuario)
                  .WithMany()
                  .HasForeignKey(i => i.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.Competencia)
                  .WithMany(c => c.Inscripciones)
                  .HasForeignKey(i => i.CompetenciaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── EvaluacionCompetencia ────────────────────────────────────────────
        modelBuilder.Entity<EvaluacionCompetencia>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Inscripcion)
                  .WithOne(i => i.Evaluacion)
                  .HasForeignKey<EvaluacionCompetencia>(e => e.InscripcionId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Evitar ciclos: EvaluadoPor -> Usuario
            entity.HasOne(e => e.EvaluadoPor)
                  .WithMany()
                  .HasForeignKey(e => e.EvaluadoPorId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // ─── PasswordResetToken ───────────────────────────────────────────────
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.CodigoHash).IsRequired().HasMaxLength(500);

            entity.HasOne(t => t.Usuario)
                  .WithMany(u => u.PasswordResetTokens)
                  .HasForeignKey(t => t.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── Seed Data ────────────────────────────────────────────────────────
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Roles
        modelBuilder.Entity<Rol>().HasData(
            new Rol { Id = 1, Nombre = "ADMIN" },
            new Rol { Id = 2, Nombre = "CONTADOR" },
            new Rol { Id = 3, Nombre = "ENTRENADOR" },
            new Rol { Id = 4, Nombre = "MIEMBRO" }
        );

        // Hash for "Admin123!"
        var passwordHash = "$2a$11$mZJ.s.JDmtQaNuZhGamf6eDqrjO6KBWxUZLPUiR974ubJoxpFunHO"; 

        modelBuilder.Entity<Usuario>().HasData(
            new Usuario
            {
                Id = 1,
                Nombre = "Admin",
                Apellido = "Sportify",
                Correo = "admin@sportify.com",
                ContrasenaHash = passwordHash,
                Activo = true,
                CreadoEn = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Usuario
            {
                Id = 2,
                Nombre = "Carlos",
                Apellido = "Contador",
                Correo = "contador@sportify.com",
                ContrasenaHash = passwordHash,
                Activo = true,
                CreadoEn = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Usuario
            {
                Id = 3,
                Nombre = "Eduardo",
                Apellido = "Entrenador",
                Correo = "entrenador@sportify.com",
                ContrasenaHash = passwordHash,
                Activo = true,
                CreadoEn = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Usuario
            {
                Id = 4,
                Nombre = "Mario",
                Apellido = "Miembro",
                Correo = "miembro@sportify.com",
                ContrasenaHash = passwordHash,
                Activo = true,
                CreadoEn = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Asignar roles
        modelBuilder.Entity<UsuarioRol>().HasData(
            new UsuarioRol { Id = 1, UsuarioId = 1, RolId = 1 }, // Admin
            new UsuarioRol { Id = 2, UsuarioId = 2, RolId = 2 }, // Contador
            new UsuarioRol { Id = 3, UsuarioId = 3, RolId = 3 }, // Entrenador
            new UsuarioRol { Id = 4, UsuarioId = 4, RolId = 4 }  // Miembro
        );

        // Sedes
        modelBuilder.Entity<Sede>().HasData(
            new Sede { Id = 1, Nombre = "Sede Principal Norte", Direccion = "Calle 100 # 15-20", Ciudad = "Bogotá" },
            new Sede { Id = 2, Nombre = "Sede Sur", Direccion = "Avenida Sur # 45-10", Ciudad = "Medellín" }
        );

        // Planes de Membresía
        modelBuilder.Entity<PlanMembresia>().HasData(
            new PlanMembresia { Id = 1, Nombre = "Plan Básico", PrecioCOP = 50000m, DuracionDias = 30, Descripcion = "Acceso a instalaciones básicas" },
            new PlanMembresia { Id = 2, Nombre = "Plan Premium", PrecioCOP = 120000m, DuracionDias = 30, Descripcion = "Acceso total y entrenamientos guiados" }
        );

        // Membresías
        modelBuilder.Entity<Membresia>().HasData(
            new Membresia 
            { 
                Id = 1, 
                UsuarioId = 4, // Mario (Miembro)
                PlanMembresiaId = 2, 
                FechaInicio = DateTime.UtcNow.AddDays(-10), 
                FechaFin = DateTime.UtcNow.AddDays(20), 
                Estado = EstadoMembresia.ACTIVA 
            }
        );

        // Pagos
        modelBuilder.Entity<Pago>().HasData(
            new Pago 
            { 
                Id = 1, 
                UsuarioId = 4, 
                MembresiaId = 1, 
                MontoCOP = 120000m, 
                FechaPago = DateTime.UtcNow.AddDays(-10), 
                Estado = EstadoPago.APROBADO, 
                AprobadoPorId = 2 // Carlos (Contador)
            }
        );

        // Competencias
        modelBuilder.Entity<Competencia>().HasData(
            new Competencia 
            { 
                Id = 1, 
                Nombre = "Torneo Relámpago", 
                Descripcion = "Torneo de fin de mes", 
                FechaInicio = DateTime.UtcNow.AddDays(5), 
                FechaFin = DateTime.UtcNow.AddDays(6), 
                Ubicacion = "Sede Principal Norte", 
                CreadoEn = DateTime.UtcNow 
            }
        );

        // Entrenamientos
        modelBuilder.Entity<Entrenamiento>().HasData(
            new Entrenamiento 
            { 
                Id = 1, 
                SedeId = 1, 
                EntrenadorId = 3, // Eduardo
                Titulo = "Entrenamiento Funcional", 
                Descripcion = "Cardio y resistencia", 
                FechaHora = DateTime.UtcNow.AddDays(1), 
                CapacidadMaxima = 20, 
                CreadoEn = DateTime.UtcNow 
            }
        );

        // Inscripciones
        modelBuilder.Entity<InscripcionCompetencia>().HasData(
            new InscripcionCompetencia 
            { 
                Id = 1, 
                UsuarioId = 4, 
                CompetenciaId = 1, 
                Estado = EstadoInscripcion.CONFIRMADA, 
                FechaInscripcion = DateTime.UtcNow 
            }
        );
    }
}
