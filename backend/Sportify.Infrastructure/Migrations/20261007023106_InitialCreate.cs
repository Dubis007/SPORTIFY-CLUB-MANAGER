using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Sportify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Competencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nombre = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "longtext", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Ubicacion = table.Column<string>(type: "longtext", nullable: false),
                    EliminadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competencias", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PlanesMembresia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nombre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "longtext", nullable: false),
                    PrecioCOP = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DuracionDias = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanesMembresia", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nombre = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "longtext", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Sedes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nombre = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Direccion = table.Column<string>(type: "longtext", nullable: false),
                    Ciudad = table.Column<string>(type: "longtext", nullable: false),
                    Telefono = table.Column<string>(type: "longtext", nullable: true),
                    Activo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sedes", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nombre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Correo = table.Column<string>(type: "varchar(256)", maxLength: 256, nullable: false),
                    ContrasenaHash = table.Column<string>(type: "longtext", nullable: false),
                    Activo = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    SolicitaCambioClave = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SedeId = table.Column<int>(type: "int", nullable: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "UTC_TIMESTAMP()"),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Sedes_SedeId",
                        column: x => x.SedeId,
                        principalTable: "Sedes",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Entrenamientos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    SedeId = table.Column<int>(type: "int", nullable: false),
                    EntrenadorId = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Descripcion = table.Column<string>(type: "longtext", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CapacidadMaxima = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "longtext", nullable: false),
                    EliminadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entrenamientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entrenamientos_Sedes_SedeId",
                        column: x => x.SedeId,
                        principalTable: "Sedes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Entrenamientos_Usuarios_EntrenadorId",
                        column: x => x.EntrenadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "InscripcionesCompetencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    CompetenciaId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    FechaInscripcion = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InscripcionesCompetencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InscripcionesCompetencia_Competencias_CompetenciaId",
                        column: x => x.CompetenciaId,
                        principalTable: "Competencias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InscripcionesCompetencia_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Membresias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    PlanMembresiaId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Estado = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Membresias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Membresias_PlanesMembresia_PlanMembresiaId",
                        column: x => x.PlanMembresiaId,
                        principalTable: "PlanesMembresia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Membresias_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PasswordResetTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    CodigoHash = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    Expiracion = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Usado = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordResetTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PasswordResetTokens_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UsuarioRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    RolId = table.Column<int>(type: "int", nullable: false),
                    AsignadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Asistencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    EntrenamientoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Presente = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Observaciones = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asistencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Asistencias_Entrenamientos_EntrenamientoId",
                        column: x => x.EntrenamientoId,
                        principalTable: "Entrenamientos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Asistencias_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EvaluacionesCompetencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    InscripcionId = table.Column<int>(type: "int", nullable: false),
                    Puntaje = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Posicion = table.Column<int>(type: "int", nullable: true),
                    Desempeno = table.Column<string>(type: "longtext", nullable: true),
                    Comentarios = table.Column<string>(type: "longtext", nullable: true),
                    EvaluadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EvaluadoPorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluacionesCompetencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluacionesCompetencia_InscripcionesCompetencia_Inscripcion~",
                        column: x => x.InscripcionId,
                        principalTable: "InscripcionesCompetencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EvaluacionesCompetencia_Usuarios_EvaluadoPorId",
                        column: x => x.EvaluadoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    MembresiaId = table.Column<int>(type: "int", nullable: true),
                    MontoCOP = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Estado = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    FechaPago = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaAprobacion = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AprobadoPorId = table.Column<int>(type: "int", nullable: true),
                    ComentarioRechazo = table.Column<string>(type: "longtext", nullable: true),
                    EliminadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pagos_Membresias_MembresiaId",
                        column: x => x.MembresiaId,
                        principalTable: "Membresias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pagos_Usuarios_AprobadoPorId",
                        column: x => x.AprobadoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Pagos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ComprobantesPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    PagoId = table.Column<int>(type: "int", nullable: false),
                    NombreArchivo = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    RutaArchivo = table.Column<string>(type: "longtext", nullable: false),
                    TipoMime = table.Column<string>(type: "longtext", nullable: false),
                    TamanoBytes = table.Column<long>(type: "bigint", nullable: false),
                    SubidoEn = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprobantesPago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComprobantesPago_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Competencias",
                columns: new[] { "Id", "CreadoEn", "Descripcion", "EliminadoEn", "FechaFin", "FechaInicio", "Nombre", "Ubicacion" },
                values: new object[] { 1, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(9938), "Torneo de fin de mes", null, new DateTime(2026, 10, 13, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(9661), new DateTime(2026, 10, 12, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(9518), "Torneo Relámpago", "Sede Principal Norte" });

            migrationBuilder.InsertData(
                table: "PlanesMembresia",
                columns: new[] { "Id", "Activo", "CreadoEn", "Descripcion", "DuracionDias", "Nombre", "PrecioCOP" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(4714), "Acceso a instalaciones básicas", 30, "Plan Básico", 50000m },
                    { 2, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(5488), "Acceso total y entrenamientos guiados", 30, "Plan Premium", 120000m }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreadoEn", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 10, 7, 2, 31, 3, 769, DateTimeKind.Utc).AddTicks(4826), "", "ADMIN" },
                    { 2, new DateTime(2026, 10, 7, 2, 31, 3, 769, DateTimeKind.Utc).AddTicks(5348), "", "CONTADOR" },
                    { 3, new DateTime(2026, 10, 7, 2, 31, 3, 769, DateTimeKind.Utc).AddTicks(5349), "", "ENTRENADOR" },
                    { 4, new DateTime(2026, 10, 7, 2, 31, 3, 769, DateTimeKind.Utc).AddTicks(5350), "", "MIEMBRO" }
                });

            migrationBuilder.InsertData(
                table: "Sedes",
                columns: new[] { "Id", "Activo", "Ciudad", "CreadoEn", "Direccion", "Nombre", "Telefono" },
                values: new object[,]
                {
                    { 1, true, "Bogotá", new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(3614), "Calle 100 # 15-20", "Sede Principal Norte", null },
                    { 2, true, "Medellín", new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(4256), "Avenida Sur # 45-10", "Sede Sur", null }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Activo", "ActualizadoEn", "Apellido", "ContrasenaHash", "Correo", "CreadoEn", "Nombre", "SedeId", "SolicitaCambioClave" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(597), "Sportify", "$2a$11$mZJ.s.JDmtQaNuZhGamf6eDqrjO6KBWxUZLPUiR974ubJoxpFunHO", "admin@sportify.com", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Admin", null, false },
                    { 2, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2027), "Contador", "$2a$11$mZJ.s.JDmtQaNuZhGamf6eDqrjO6KBWxUZLPUiR974ubJoxpFunHO", "contador@sportify.com", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Carlos", null, false },
                    { 3, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2031), "Entrenador", "$2a$11$mZJ.s.JDmtQaNuZhGamf6eDqrjO6KBWxUZLPUiR974ubJoxpFunHO", "entrenador@sportify.com", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Eduardo", null, false },
                    { 4, true, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2033), "Miembro", "$2a$11$mZJ.s.JDmtQaNuZhGamf6eDqrjO6KBWxUZLPUiR974ubJoxpFunHO", "miembro@sportify.com", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mario", null, false }
                });

            migrationBuilder.InsertData(
                table: "Entrenamientos",
                columns: new[] { "Id", "CapacidadMaxima", "CreadoEn", "Descripcion", "EliminadoEn", "EntrenadorId", "Estado", "FechaFin", "FechaHora", "SedeId", "Titulo" },
                values: new object[] { 1, 20, new DateTime(2026, 10, 7, 2, 31, 3, 771, DateTimeKind.Utc).AddTicks(1478), "Cardio y resistencia", null, 3, "PENDIENTE", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 10, 8, 2, 31, 3, 771, DateTimeKind.Utc).AddTicks(1205), 1, "Entrenamiento Funcional" });

            migrationBuilder.InsertData(
                table: "InscripcionesCompetencia",
                columns: new[] { "Id", "CompetenciaId", "Estado", "FechaInscripcion", "UsuarioId" },
                values: new object[] { 1, 1, "CONFIRMADA", new DateTime(2026, 10, 7, 2, 31, 3, 771, DateTimeKind.Utc).AddTicks(2464), 4 });

            migrationBuilder.InsertData(
                table: "Membresias",
                columns: new[] { "Id", "ActualizadoEn", "CreadoEn", "Estado", "FechaFin", "FechaInicio", "PlanMembresiaId", "UsuarioId" },
                values: new object[] { 1, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(5987), new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(5987), "ACTIVA", new DateTime(2026, 10, 27, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(6679), new DateTime(2026, 9, 27, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(6473), 2, 4 });

            migrationBuilder.InsertData(
                table: "UsuarioRoles",
                columns: new[] { "Id", "AsignadoEn", "RolId", "UsuarioId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2526), 1, 1 },
                    { 2, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2955), 2, 2 },
                    { 3, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2956), 3, 3 },
                    { 4, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(2956), 4, 4 }
                });

            migrationBuilder.InsertData(
                table: "Pagos",
                columns: new[] { "Id", "ActualizadoEn", "AprobadoPorId", "ComentarioRechazo", "CreadoEn", "EliminadoEn", "Estado", "FechaAprobacion", "FechaPago", "MembresiaId", "MontoCOP", "UsuarioId" },
                values: new object[] { 1, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(7440), 2, null, new DateTime(2026, 10, 7, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(7440), null, "APROBADO", null, new DateTime(2026, 9, 27, 2, 31, 3, 770, DateTimeKind.Utc).AddTicks(8031), 1, 120000m, 4 });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_EntrenamientoId",
                table: "Asistencias",
                column: "EntrenamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencias_UsuarioId_EntrenamientoId",
                table: "Asistencias",
                columns: new[] { "UsuarioId", "EntrenamientoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComprobantesPago_PagoId",
                table: "ComprobantesPago",
                column: "PagoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Entrenamientos_EntrenadorId",
                table: "Entrenamientos",
                column: "EntrenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entrenamientos_SedeId",
                table: "Entrenamientos",
                column: "SedeId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluacionesCompetencia_EvaluadoPorId",
                table: "EvaluacionesCompetencia",
                column: "EvaluadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluacionesCompetencia_InscripcionId",
                table: "EvaluacionesCompetencia",
                column: "InscripcionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InscripcionesCompetencia_CompetenciaId",
                table: "InscripcionesCompetencia",
                column: "CompetenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_InscripcionesCompetencia_UsuarioId_CompetenciaId",
                table: "InscripcionesCompetencia",
                columns: new[] { "UsuarioId", "CompetenciaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Membresias_PlanMembresiaId",
                table: "Membresias",
                column: "PlanMembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Membresias_UsuarioId",
                table: "Membresias",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_AprobadoPorId",
                table: "Pagos",
                column: "AprobadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_MembresiaId",
                table: "Pagos",
                column: "MembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioId",
                table: "Pagos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_UsuarioId",
                table: "PasswordResetTokens",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioRoles_RolId",
                table: "UsuarioRoles",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioRoles_UsuarioId_RolId",
                table: "UsuarioRoles",
                columns: new[] { "UsuarioId", "RolId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Correo",
                table: "Usuarios",
                column: "Correo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_SedeId",
                table: "Usuarios",
                column: "SedeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Asistencias");

            migrationBuilder.DropTable(
                name: "ComprobantesPago");

            migrationBuilder.DropTable(
                name: "EvaluacionesCompetencia");

            migrationBuilder.DropTable(
                name: "PasswordResetTokens");

            migrationBuilder.DropTable(
                name: "UsuarioRoles");

            migrationBuilder.DropTable(
                name: "Entrenamientos");

            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "InscripcionesCompetencia");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Membresias");

            migrationBuilder.DropTable(
                name: "Competencias");

            migrationBuilder.DropTable(
                name: "PlanesMembresia");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Sedes");
        }
    }
}
